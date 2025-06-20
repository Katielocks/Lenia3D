import * as tf from '@tensorflow/tfjs'
import {fftn} from './FftUtils.js'
import {roll} from './GridUtils.js'
/**
 * A collection of “kernel core” functions that produce radial weight values.
 * Each function takes a normalized distance `r` (0 to 1) and returns a scalar weight.
 */
const kernel_core = {
  /**
   * Polynomial kernel (quad^4).
   * @param {tf.Tensor} r Normalized distance tensor in [0, 1].
   * @returns {tf.Tensor} Computed polynomial kernel values.
   */
  0: (r) => tf.tidy(() =>
    tf.pow(
      tf.mul(
        tf.mul(4, r),
        tf.sub(1, r),
      ),
      4,
    )
  ),

  /**
   * Exponential / Gaussian-like bump (bump^4).
   * @param {tf.Tensor} r Normalized distance tensor in [0, 1].
   * @returns {tf.Tensor} Computed exponential bump values.
   */
  1: (r) => tf.tidy(() =>
    tf.exp(
      tf.sub(
        4,
        tf.div(1, tf.mul(r, tf.sub(1, r))),
      )
    )
  ),

  /**
   * Step function, returns 1 if r is in [q, 1-q], else 0.
   * @param {tf.Tensor} r Normalized distance tensor in [0, 1].
   * @param {number} [q=1/4] The margin from each boundary where the step occurs.
   * @returns {tf.Tensor} Step function result (0 or 1).
   */
  2: (r, q = 1/4) => tf.tidy(() =>
    tf.logicalAnd(
      tf.greaterEqual(r, q),
      tf.lessEqual(r, 1 - q)
    ).cast('float32')
  ),

  /**
   * Staircase function used in certain automata (e.g., Conway’s Life).
   * @param {tf.Tensor} r Normalized distance tensor in [0, 1].
   * @param {number} [q=1/4] The margin from each boundary where the step transitions.
   * @returns {tf.Tensor} A combination of step and conditional logic.
   */
  3: (r, q = 1/4) => tf.tidy(() =>
    tf.add(
      tf.logicalAnd(
        tf.greaterEqual(r, q),
        tf.lessEqual(r, 1 - q)
      ).cast('float32'),
      tf.logicalAnd(tf.less(r, q), 0.5)
    )
  ),
};

/**
 * A collection of “growth” functions for different growth behaviors, often used in
 * cellular automata or other iterative processes.
 */

/**
 * @param {number[]} size Dimensions of the desired output tensor.
 * @returns {tf.Tensor[]} An array of rank-dimensional coordinate grids.
 */
function createCoordinateGrids(size) {

  const rank = size.length;
  const coords = [];
  return tf.tidy(() =>{
  for (let i = 0; i < rank; i++) {
    const mid = Math.floor(size[i] / 2);
    const extra = size[i] % 2; 
    let range = tf.range(-mid, mid + extra, 1);
    
    // Reshape and tile so that each coordinate dimension is broadcast appropriately
    const shape = Array(rank).fill(1);
    shape[i] = size[i];
    range = range.reshape(shape);
    
    const tile = size.map((val, idx) => (idx === i ? 1 : val));
    coords.push(range.tile(tile));
  }
  return coords});
}

/**
 * @param {number[]} size Dimensions of the desired distance field.
 * @param {number} R Radius to use for normalization.
 * @returns {tf.Tensor} A tensor of shape `size` with normalized distances.
 */
function createDistanceField(size, R) {
  return tf.tidy(() =>{
  const coords = createCoordinateGrids(size);
  let D = tf.zeros(size);
  coords.forEach(coord => {
    D = D.add(coord.square());
  });
  return D.sqrt().div(R)});
}

/**
 * @param {tf.Tensor} r Normalized distance tensor in [0, ∞).
 * @param {object} params Parameter object containing shell weights, etc.
 * @param {function} kernelCoreFn One of the functions from `kernel_core`.
 * @returns {tf.Tensor} Weighted values for each location in `r`.
 */
function kernelShell(r, params, kernelCoreFn) {
  return tf.tidy(() => {
    const bs = tf.tensor1d(params.b, 'float32');
    const B = bs.shape[0];
    const Br = r.mul(B);
    const floorBr = Br.floor();
    const idx = tf.minimum(floorBr, B - 1);
    const bVals = bs.gather(idx.cast('int32'));
    const fraction = Br.mod(1);
    const mask = r.less(1);
    const kfuncVals = kernelCoreFn(fraction);
    return mask.mul(kfuncVals).mul(bVals);
  });
}
/**
 * @typedef {Object} KernelParams
 * @property {number} R  - The radius for distance normalization.
 * @property {number[]} b - An array of shell coefficients.
 * @property {number} kn - The kernel core function index (1-based) to use from `kernel_core`.
 */

/**
 *
 * @param {number[]} size       Dimensions for the kernel (e.g., [width, height, depth]).
 * @param {KernelParams} params An object containing kernel parameters.
 */
export function generateKernel(size, params) {
  const kernelCoreFn = kernel_core[params.kn - 1];

  // Generate and assign the kernel in a tidy block to avoid memory leaks
  return tf.tidy(() => {
    const D = createDistanceField(size, params.R);
    let K = kernelShell(D, params, kernelCoreFn);
    K = K.div(K.sum());
    const mid = size.map(x => Math.floor(x / 2));
    K = roll(K, [0, 1, 2], mid);
    const Kc = K.cast('complex64');
    return fftn(Kc);
  });

}

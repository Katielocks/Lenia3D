import * as tf from '@tensorflow/tfjs'

/**
 * Rolls the given tensor along specified axes by the specified shifts.
 * @param {tf.Tensor} grid - The input tensor to roll.
 * @param {number[]} axes - Axes to roll along.
 * @param {number[]} shifts - Amounts to shift along each axis.
 * @returns {tf.Tensor} - The rolled tensor.
 */
export function roll(grid, axes, shifts) {
    return tf.tidy(() => {
      let result = grid;
      axes.forEach((axis, i) => {
        const size = result.shape[axis];
        const shift = shifts[i];
        const effectiveShift = ((shift % size) + size) % size;
        if (effectiveShift === 0) return;
        const splitPoint = size - effectiveShift;
        const [a, b] = tf.split(result, [splitPoint, effectiveShift], axis);
        result = tf.concat([b, a], axis);
      });
      return result;
    });
  }
  
  /**
   * Resizes a tensor to the given size. If complex, splits into real/imag and resizes them separately.
   * @param {tf.Tensor} grid - The input tensor to resize.
   * @param {number[]} size - The target size.
   * @returns {tf.Tensor} - The resized tensor.
   */
  export function resize(grid, size) {
    if (grid.dtype === 'complex64') {
      const real = tf.real(grid);
      const imag = tf.imag(grid);
      return tf.tidy(() => {
        return tf.complex(
          resize(real, size),
          resize(imag, size)
        );
      });
    }
    let padding = size.map((x, i) => x - grid.shape[i]);
    const error = padding.map(x => Math.abs(x % 2));
    padding = padding.map((x, i) => [Math.floor(x / 2), Math.floor(x / 2) + error[i]]);
    return tf.pad(grid, padding);
  }
  
  /**
   * Repeats a tensor along a specified axis.
   * @param {tf.Tensor} tensor - The input tensor.
   * @param {number} axis - The axis to repeat along.
   * @param {number} repeats - How many times to repeat along the axis.
   * @returns {tf.Tensor} - The repeated tensor.
   */
  function repeatAlongAxis(tensor, axis, repeats) {
    return tf.tidy(() => {
      const expanded = tensor.expandDims(axis + 1);
      const tiling = new Array(expanded.rank).fill(1);
      tiling[axis + 1] = repeats;
      const tiled = expanded.tile(tiling);
      const newShape = [...tensor.shape];
      newShape[axis] *= repeats;
      return tiled.reshape(newShape);
    });
  }
  
  /**
   * Zooms a tensor by repeating its data along every axis.
   * @param {tf.Tensor} tensor - The input tensor.
   * @param {number} zoom - The integer zoom factor.
   * @returns {tf.Tensor} - The zoomed tensor.
   */
  export function zoom(tensor, zoom) {
    return tf.tidy(() => {
      let currentTensor = tensor;
      for (let i = 0; i < tensor.rank; i++) {
        currentTensor = repeatAlongAxis(currentTensor, i, zoom);
      }
      return currentTensor;
    });
  }
  export function updateVariable(variable, replacement) {
    tf.tidy(() => {
      variable.assign(replacement);
    });
  }

export function Condense(){
    return tf.tidy(()=>{ 
        const Zaxis = this.grid.shape[0]
        const CondensedGrid = this.grid.sum(0)
        const NormalisedGrid = CondensedGrid.div(Zaxis)
        return NormalisedGrid})
}

export function det(m) {
    return tf.tidy(() => {
        const [r, _] = m.shape;
        if (r === 2) {
            const t = m.as1D();
            const a = t.slice([0], [1]).dataSync()[0];
            const b = t.slice([1], [1]).dataSync()[0];
            const c = t.slice([2], [1]).dataSync()[0];
            const d = t.slice([3], [1]).dataSync()[0];
            const result = a * d - b * c;
            return result;
        } else {
            let s = 0;
            const rows = [...Array(r).keys()];
            for (let i = 0; i < r; i++) {
                const rowIndices = rows.filter(e => e !== i);
                const sub_m = m.gather(tf.tensor1d(rowIndices, 'int32'));
                const sli = sub_m.slice([0, 1], [r - 1, r - 1]);
                const element = m.slice([i, 0], [1, 1]).dataSync()[0];
                s += Math.pow(-1, i) * element * this.det(sli);
            }
            return s;
        }
    });
}

export function invertMatrix(m) {
    return tf.tidy(() => {
        const d = this.det(m);
        if (d === 0) {
            console.log("Matrix is singular, cannot invert.");
            return null;
        }
        const [r, _] = m.shape;
        const rows = [...Array(r).keys()];
        const dets = [];
        for (let i = 0; i < r; i++) {
            for (let j = 0; j < r; j++) {
                const rowIndices = rows.filter(e => e !== i);
                const sub_m = m.gather(tf.tensor1d(rowIndices, 'int32'));
                let sli;
                if (j === 0) {
                    sli = sub_m.slice([0, 1], [r - 1, r - 1]);
                } else if (j === r - 1) {
                    sli = sub_m.slice([0, 0], [r - 1, r - 1]);
                } else {
                    const [a, b, c] = tf.split(sub_m, [j, 1, r - (j + 1)], 1);
                    sli = tf.concat([a, c], 1);
                }
                const minorDet = this.det(sli);
                dets.push(Math.pow(-1, i + j) * minorDet);
            }
        }
        const com = tf.tensor2d(dets, [r, r]);
        const tr_com = com.transpose();
        const inv_m = tr_com.div(tf.scalar(d));
        return inv_m;
    });
}   

export function random(size,bounds,min,max,density,seed = null){
  return tf.tidy(() => {
  const randomGrid = tf.randomUniform(bounds, min, max, 'float32', seed)
  const randomBoolGrid = tf.randomUniform(bounds, 0, 1, 'float32', seed).less(density)
  const new_grid = tf.mul(randomGrid,randomBoolGrid)
  return tf.cast(resize(new_grid,size),'float32')})
}


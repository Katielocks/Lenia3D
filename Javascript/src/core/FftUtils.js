
import * as tf from '@tensorflow/tfjs'
/**
 * Validates whether the provided value is a valid TensorFlow.js tensor.
 * 
 * @param {*} x - The value to check.
 * @param {string} functionName - Name of the calling function for error context.
 */
function validateTensor(x, functionName) {
  if (!x || !(x instanceof tf.Tensor)) {
    throw new Error(`[${functionName}] The input must be a valid tf.Tensor.`);
  }
}

/**
 * Validates that the given axis is within the correct range for the tensor.
 * 
 * @param {number} axis - The axis to check.
 * @param {number} rank - The total number of dimensions in the tensor.
 * @param {string} functionName - Name of the calling function for error context.
 */
function validateAxis(axis, rank, functionName) {
  if (!Number.isInteger(axis) || axis < 0 || axis >= rank) {
    throw new Error(
      `[${functionName}] Axis ${axis} is out of valid range [0, ${rank - 1}].`
    );
  }
}

/**
 * Transposes the real and imaginary parts of a complex tensor
 * based on a provided permutation of its dimensions.
 * 
 * @param {tf.Tensor} tensor - The input complex tensor to transpose.
 * @param {number[]} perm - The permutation of the dimensions.
 * @returns {tf.Tensor} - The transposed complex tensor.
 */
function transposeComplexTensor(tensor, perm) {
  return tf.tidy(() => {
    const realPart = tf.real(tensor).reshape(tensor.shape).transpose(perm);
    const imagPart = tf.imag(tensor).reshape(tensor.shape).transpose(perm);
    return tf.complex(realPart, imagPart);
  });
}

/**
 * Performs a 1D FFT along a specified axis.
 * 
 * @param {tf.Tensor} x - The input tensor (real or complex).
 * @param {number} axis - The axis along which to compute the FFT.
 * @returns {tf.Tensor} - The tensor after performing the FFT on the specified axis.
 */
function fftOnAxis(x, axis) {
  validateTensor(x, 'fftOnAxis');
  const rank = x.shape.length;
  validateAxis(axis, rank, 'fftOnAxis');

  return tf.tidy(() => {
    const perm = Array.from({ length: rank }, (_, i) => i);
    [perm[axis], perm[rank - 1]] = [perm[rank - 1], perm[axis]];
    
    const transposed = transposeComplexTensor(x, perm);
    const freq = tf.spectral.fft(transposed);
    
    return transposeComplexTensor(freq, perm);
  });
}

/**
 * Computes the n-dimensional Discrete Fourier Transform of a tensor.
 * 
 * @param {tf.Tensor} x - The input tensor (real or complex).
 * @returns {tf.Tensor} - The n-dimensional FFT of the input tensor.
 */
export function fftn(x) {
  validateTensor(x, 'fftn');
  if (x.shape.length === 0) {
    throw new Error('[fftn] Input tensor must have at least one dimension.');
  }

  return tf.tidy(() => {
    const rank = x.shape.length;
    let out = x;
    for (let axis = 0; axis < rank; axis++) {
      out = fftOnAxis(out, axis);
    }
    return out;
  });
}

/**
 * Performs a 1D IFFT along a specified axis.
 * 
 * @param {tf.Tensor} x - The input tensor (typically complex, can be real).
 * @param {number} axis - The axis along which to compute the IFFT.
 * @returns {tf.Tensor} - The tensor after performing the IFFT on the specified axis.
 */
function ifftOnAxis(x, axis) {
  validateTensor(x, 'ifftOnAxis');
  const rank = x.shape.length;
  validateAxis(axis, rank, 'ifftOnAxis');

  return tf.tidy(() => {
    const perm = Array.from({ length: rank }, (_, i) => i);
    [perm[axis], perm[rank - 1]] = [perm[rank - 1], perm[axis]];

    const transposed = transposeComplexTensor(x, perm);
    const time = tf.spectral.ifft(transposed);

    return transposeComplexTensor(time, perm);
  });
}

/**
 * Computes the n-dimensional Inverse Discrete Fourier Transform of a tensor.
 * 
 * @param {tf.Tensor} x - The input tensor (complex or real).
 * @returns {tf.Tensor} - The n-dimensional IFFT of the input tensor.
 */
export function ifftn(x) {
  validateTensor(x, 'ifftn');
  if (x.shape.length === 0) {
    throw new Error('[ifftn] Input tensor must have at least one dimension.');
  }

  return tf.tidy(() => {
    const rank = x.shape.length;
    let out = x;
    for (let axis = 0; axis < rank; axis++) {
      out = ifftOnAxis(out, axis);
    }
    return out;
  });
}

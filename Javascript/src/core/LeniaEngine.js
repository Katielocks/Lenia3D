import * as tf from '@tensorflow/tfjs'
import { fftn, ifftn } from './FftUtils.js';
import { generateKernel } from './KernelGen.js';
import { SelectAnimalID } from '../utils/load.js';
import { resize,random } from './GridUtils.js';

function polynomialQuad(n, m, s) {
  return tf.tidy(() => {return tf.sub(tf.mul(tf.pow(tf.maximum(0,tf.sub(1,tf.div(tf.pow(tf.sub(n,m),2),tf.mul(9,tf.pow(s,2))))),4),2),1) })
}

function gauss(n, m, s) {
  return tf.tidy(() => {return tf.sub(tf.mul(tf.exp(tf.div(tf.neg(tf.pow(tf.sub(n, m), 2)), tf.mul(2, tf.pow(s, 2))))), 1)})  
}

function stepz(n, m, s) {
  return tf.tidy(() => {return tf.sub(tf.logicalAnd(tf.lessEqual(tf.abs(tf.sub(n, m)), s), 2), 1)})
}

const growthFunctions = [polynomialQuad, gauss, stepz];

export class LeniaEngine {
  constructor(params, shape) {
    this.params = { ...params };
    this.shape = shape;
    this.genShape = shape.map(x=>Math.floor(x*0.8))
    this.generation = 0
    this.time = 0
    this.grid = tf.variable(tf.zeros(shape));
    this.kernel = tf.variable(tf.zeros(shape).cast('complex64'));
    this.isRunning = false
    
    // Create initial kernel
    const initKernel = generateKernel(shape, this.params);
    this.kernel.assign(initKernel);
  }
  setShape(newShape){
    this.shape = newShape
    tf.tidy(()=>{
      this.grid = tf.variable(resize(this.grid,this.shape))
      this.kernel = tf.variable(generateKernel(this.shape,this.params))
    })

  }
  

  setParams(newParams) {
    this.params = { ...this.params, ...newParams };
    const newKernel = generateKernel(this.shape, this.params);
    this.kernel.assign(newKernel);
    this.onParamChange =  true
  }
  loadAnimal(animalID){
    const AnimalCode = SelectAnimalID(animalID);  
    this.id = AnimalCode.id
    this.seed = null
    this.name = AnimalCode.name
    this.setParams(AnimalCode.params)
    tf.tidy(()=>{this.grid.assign(resize(AnimalCode.tensor,this.shape))})
    this.generation = 0;
    this.time = 0
    this.onStep = this.isRunning ? null : true
  }

  loadRandom(size,bounds,min,max,density){
    if (this.seed==null){
      const random = Math.random()
      this.seed = parseInt(random * 10**(toString(random).length-2)) 
    }
    this.shape = size
    this.bounds = bounds
    this.min = min
    this.max = max
    this.density = density
    tf.tidy(()=>{
    this.grid = tf.variable(random(size,bounds,min,max,density,this.seed))
    this.kernel = tf.variable(generateKernel(this.shape, this.params))
    })
    this.id = null
    this.name = null
    this.generation = 0;
    this.time = 0
    this.onStep = this.isRunning ? null : true
  }
  reset(){
    if (this.id) {this.loadAnimal(this.id)}
    else {this.loadRandom(this.shape,this.bounds,this.min,this.max,this.density,this.seed)}
  }

  step() {
    tf.tidy(() => {
      const complexGrid = this.grid.cast("complex64") 
      const gridFFT = fftn(complexGrid);
      const potentialFFT = tf.mul(gridFFT, this.kernel);
      const ifftResult = ifftn(potentialFFT);
      const U = tf.real(ifftResult);
      const g = growthFunctions[this.params.gn - 1];
      const field = g(U, this.params.m, this.params.s);
      const dt = 1 / this.params.T; 
      const newGrid = this.grid.add(field.mul(dt)).clipByValue(0, 1);
      this.grid.assign(newGrid);
    });
    this.generation += 1
    this.time = Number((this.time + 1 / this.params['T']).toFixed(1));
  }
}
# Lenia3D

> 🚀 **[Live Demo](https://katielocks.github.io/Projects/Lenia3D/)**  
> Explore interactive 3D Lenia simulations in your browser.

Lenia3D is an exploration of the Lenia cellular automaton in three dimensions. The repository contains two separate implementations:

* **Javascript** – a React application powered by TensorFlow.js and WebGL for interactive, GPU‑accelerated simulations directly in the browser.
* **Python** – a PyTorch based prototype for generating meshes and plotting animations of Lenia3D states with Plotly.

Both versions implement convolution-based updates on a 3‑D grid and support random initialisation or loading predefined "animals".

## Javascript Application

The web client lives in [`Javascript/`](Javascript/). It uses React for the interface, TensorFlow.js to manage tensors, and custom WebGL shaders for rendering.


### Setup
```bash
cd Javascript
npm install
npm start
```
This starts the development server on <http://localhost:3000>.

To create a production build run:
```bash
npm run build
```

## Python Scripts

The [`Python/`](Python/) directory contains scripts for experimenting with a 3‑D Lenia grid using PyTorch. The main entry point is `plotting.py`, which renders animated meshes with Plotly.

### Requirements
- PyTorch
- NumPy
- Plotly

### Example
```bash
cd Python
python -i plotting.py
```
Inside the Python interpreter you can call:
```python
plot_mesh(time=10, frames=40, radius=4, m=0.15, s=0.015, grid_size=64)
```
This generates a short animation of the evolving system.

## Data

`Javascript/src/data/animals3D.js` includes a catalog of predefined Lenia creatures encoded in run-length notation. They can be loaded from the UI.

## License

This project is provided for educational and research purposes.

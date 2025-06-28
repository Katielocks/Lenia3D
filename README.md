# Lenia3D

<p align="center">
  <a href="https://katielocks.github.io/Projects/Lenia3D/" target="_blank" rel="noopener">
    <img src="lenia.gif" width="400px" alt="Lenia3D Simulation" />
  </a>
</p>

> 🚀 **[Live Demo](https://katielocks.github.io/Projects/Lenia3D/)**
> Explore an interactive 3D Lenia simulation!

Lenia3D is an exploration of the **Lenia** continuous cellular automaton in three dimensions. The repository contains the source code for a web application:

---



## Javascript Application

The web client uses React for the interface, TensorFlow\.js to manage tensors, and custom WebGL shaders for rendering.

### Setup

```bash
npm install
npm start
```

This starts the development server on [http://localhost:3000](http://localhost:3000).

To create a production build, run:

```bash
npm run build
```

---

## Data

`Javascript/src/data/animals3D.js` includes a catalog of predefined Lenia creatures encoded in run‑length notation. These can be loaded from the UI.

---

## Attribution & Inspiration

Lenia3D is **heavily inspired by [Lenia](https://github.com/Chakazul/Lenia)**, a system of continuous cellular automata created by **Bert Wang‑Chak Chan** ([@Chakazul](https://github.com/Chakazul)). If you are new to Lenia, we highly recommend exploring the original project:

* **GitHub repository:** [https://github.com/Chakazul/Lenia](https://github.com/Chakazul/Lenia)
* **Interactive web demo:** [https://chakazul.github.io/Lenia/JavaScript/Lenia.html](https://chakazul.github.io/Lenia/JavaScript/Lenia.html)
* **Preprint:** *Lenia — Biology of Artificial Life* (2019) — [https://arxiv.org/abs/1812.05433](https://arxiv.org/abs/1812.05433)

This 3‑D extension re‑implements the same kernel‑convolution growth dynamics and continuous‑state philosophy in three spatial dimensions. All credit for the original idea, taxonomy, and many of the kernel and growth‑function parameters goes to Bert Chan.

---

## License

This project is provided for educational and research purposes.

export class Orbital {
    constructor(renderer) {
        // The renderer is "composed" inside the orbital
        this.render = renderer;              
        this.canvas = renderer.canvas;
        this.forward = renderer.forward
        this.right = renderer.right 
        this.up = renderer.up      
        this.cameraPos = renderer.cameraPos; 
        this.cameraTarget = renderer.cameraTarget;
        this.updateVectors = renderer.updateVectors.bind(renderer);
    
        // and so on...
        this.isDragging = false;
        this.computeSpherical();
        this.attachDOMEvents();
    }
    
    attachDOMEvents() {
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('wheel', this.onMouseWheel.bind(this));
    }

    computeSpherical() {
        const dx = this.cameraPos[0] - this.cameraTarget[0];
        const dy = this.cameraPos[1] - this.cameraTarget[1];
        const dz = this.cameraPos[2] - this.cameraTarget[2];
        
        this.radius = Math.sqrt(dx*dx + dy*dy + dz*dz);
        this.theta = Math.atan2(dz, dx);       
        this.phi = Math.acos(dy / this.radius); 
    }

    updateCameraPosition() {
        const x = this.radius * Math.sin(this.phi) * Math.cos(this.theta);
        const y = this.radius * Math.cos(this.phi);
        const z = this.radius * Math.sin(this.phi) * Math.sin(this.theta);
      
        // Correctly add x→0, y→1, z→2
        this.cameraPos[0] = this.cameraTarget[0] + x;
        this.cameraPos[1] = this.cameraTarget[1] + y;
        this.cameraPos[2] = this.cameraTarget[2] + z;
      }

    onMouseDown(event) {
        this.isDragging = true;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        event.preventDefault();
    }

    onMouseUp(event) {
        this.isDragging = false;
        event.preventDefault();
    }

    onMouseMove(event) {
        if (!this.isDragging) return;
        
        const deltaX = event.clientX - this.lastMouseX;
        const deltaY = event.clientY - this.lastMouseY;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;

        if (event.shiftKey) {
            this.pan(deltaX, deltaY);
        } else {
            this.rotate(deltaX, deltaY);
        }
        this.updateVectors();   
        this.render.render();
        event.preventDefault();
    }

    onMouseWheel(event) {
        this.zoom(event.deltaY);
        this.updateVectors();
        this.render.render();
        event.preventDefault();
    }

    rotate(deltaX, deltaY) {
        const sensitivity = 0.01;
        // Horizontal drag changes theta (azimuth)
        this.phi += deltaX * sensitivity;
        // Vertical drag changes phi (polar)
        this.theta   += deltaY * sensitivity;
      
        // Clamp phi to avoid flipping over the poles
        this.phi = Math.max(0.01 * Math.PI, Math.min(Math.PI, 0.99*this.phi));
      
        this.updateCameraPosition();
      }
      

    pan(deltaX, deltaY) {
        const sensitivity = 0.005 * this.radius;
        const panX = this.right[0] * deltaX * sensitivity + this.up[0] * deltaY * sensitivity;
        const panY = this.right[1] * deltaX * sensitivity + this.up[1] * (-deltaY) * sensitivity;
        const panZ = this.right[2] * deltaX * sensitivity + this.up[2] * (-deltaY) * sensitivity;

        this.cameraTarget[0] += panX;
        this.cameraTarget[1] += panY;
        this.cameraTarget[2] += panZ;
        this.cameraPos[0] += panX;
        this.cameraPos[1] += panY;
        this.cameraPos[2] += panZ;
    }

    zoom(deltaY) {
        const sensitivity = 0.001;
        this.radius *= 1 + deltaY * sensitivity;
        this.radius = Math.max(0.1, Math.min(this.radius, 1000));
        this.updateCameraPosition();
        this.render.render()
    }
}
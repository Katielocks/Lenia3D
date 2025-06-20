  import React, { useState, useEffect, useRef, createContext } from 'react';
  import * as tf from '@tensorflow/tfjs';

  // Components
  import { Topbar } from './components/Topbar'
  import { Sidebar } from './components/Sidebar';
  import { MainContent } from './components/MainContent';
  import { Menu } from './components/Menu'
  import { Simulation } from './components/Simulation';
  import { PopulateAnimalList } from './components/AnimalList';
  import { ParameterModal } from './components/ParameterModal';
  import { debounce } from 'lodash';

  // Core
  import { LeniaEngine } from './core/LeniaEngine';
  import { Renderer3D } from './render/Renderer3D';

  export const EngineContext = createContext();



  export default function App() {
    const canvasRef = useRef(null);
    const engineRef = useRef(null);
    const rendererRef = useRef(null);

    const [uiState, setUiState] = useState({
      layout: 'row-main',
      dimension: '3D',
      menumode: 'edit',
      sidebarState: 'reduced',
      initialized: false,
      isRunning: false,
      reset : false,
      showParamOverlay: false
    });
    const [simState, setSimState] = useState({
      params: {
        R: 15,
        T: 10,
        m: 0.1,
        s: 0.01,
        b: [1],
        kn: 1,
        gn: 1,
      },
      dim : [64,64,64],
      seed: null,
      name: null,
      generation: 0,
      timeCount: 0  
    });
    const [genState, setGenState] = useState({
      params: {
        R: 15,
        T: 10,
        m: 0.1,
        s: 0.01,
        b: [1],
        kn: 1,
        gn: 1,
      },
      density: 0.5,
      range : [0,1],
      dimBounds : [[32,64],[32,64],[32,64]],
      seed: null,
      generation : 0,
      timeCount : 0
    });

    const [renderState, setRenderState] = useState({
      frameCount : 0
    });



  useEffect(() => {
    const canvas = canvasRef.current;
    const customBackend = new tf.MathBackendWebGL(canvas);
    tf.registerBackend('custom-webgl', () => customBackend);
    canvas.getContext('webgl2');

    // Initialize Lenia Engine
    const initEngine = new LeniaEngine(
      simState.params,
      simState.dim
    );

      const initRenderer = new Renderer3D(canvas, initEngine);
    engineRef.current = initEngine;
    rendererRef.current = initRenderer;
    initEngine.loadAnimal(40);
    setSimState(prev => ({
      ...prev,
      seed: initEngine.seed,
      name: initEngine.name,
    }));
    initRenderer.render();

    setUiState(prev => ({ ...prev,  initialized: true}))

  }, []); 
  const isRunningRef = useRef();
  useEffect(() => {
    isRunningRef.current = uiState.isRunning;
  }, [uiState.isRunning]);

  useEffect(() => {
    
    let animationFrameId;
    let lastStepTime = 0;

    const animate = (timestamp) => {
      animationFrameId = requestAnimationFrame(animate);

      if (!lastStepTime) {
        lastStepTime = timestamp;
      }
      if (isRunningRef.current && engineRef.current && rendererRef.current) {
        const elapsed = timestamp - lastStepTime;
        const stepInterval = 1000 / engineRef.current.params.T;
        if (rendererRef.current.volumeData != engineRef.current.grid){
          rendererRef.current.volumeData = engineRef.current.grid
        }
        if (elapsed >= stepInterval) {
          engineRef.current.step();
          setSimState(prev => ({ ...prev, timeCount: engineRef.current.time }))
          setSimState(prev => ({ ...prev, generation: engineRef.current.generation }))
          rendererRef.current.render();
          lastStepTime = timestamp;
        }
      }
    };

    // Start the loop
    animationFrameId = requestAnimationFrame(animate);

    // Cleanup on unmount
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []); 
      
    useEffect(() => {
      engineRef.current.isRunning = uiState.isRunning
    },[uiState.isRunning]);

    
    useEffect(() => {
      setSimState(prev => ({ ...prev, params: engineRef.current.params }))
      setGenState(prev => ({ ...prev, params: engineRef.current.params }))
      engineRef.current.onParamChange = null
    },[engineRef?.current?.onParamChange]);

    useEffect(() => {
      engineRef.current.setParams(simState.params)
    },[simState.params])


    useEffect(() => {
      setSimState(prev => ({ ...prev, timeCount: engineRef.current.time }))
      setSimState(prev => ({ ...prev, generation: engineRef.current.generation }))
      engineRef.current.onStep = null
    },[engineRef?.current?.onStep]);

    useEffect(() => {
      engineRef.current.generation = simState.generation
      engineRef.current.time = simState.timeCount
    },[simState.timeCount,simState.generation])
    
    useEffect(() => {
      engineRef.current.setShape(simState.dim)
      rendererRef.current.volumeData = engineRef.current.grid
      rendererRef.current.render()
    },[simState.dim])



    useEffect(() => {
      if (engineRef) {
        PopulateAnimalList(engineRef.current, setSimState);
      }
    }, [engineRef]);
    useEffect(() => {
      engineRef.current.reset()
      rendererRef.current.volumeData = engineRef.current.grid
      rendererRef.current.render()
      setSimState(prev => ({ ...prev, seed: engineRef.current.seed, name: engineRef.current.name }))
      setUiState(prev => ({ ...prev, reset: prev.reset=false }))}
      ,[uiState.reset])
    useEffect(() => {
      const debouncedRender = debounce(() => {rendererRef.current.onResize();}, 60); 
      const observer = new ResizeObserver(entries => {
        for (let entry of entries) {
          debouncedRender();
        }
      });
      if (canvasRef.current) {
        observer.observe(canvasRef.current);
      }
      return () => {
        if (canvasRef.current) {
          observer.unobserve(canvasRef.current);
        }
        debouncedRender.cancel();
      };
    }, [canvasRef]);

    const handleGenerate = () => {
      setUiState((prev) => ({ ...prev, menumode: 'edit' }));
      const dimBounds = genState.dimBounds;
      const bounds = dimBounds.map((x) => x[0]);
      const dim = dimBounds.map((x) => x[1]);
      setSimState((prev) => ({ ...prev, params: genState.params }));
      setSimState((prev) => ({ ...prev, dim: dim }));

      engineRef.current.loadRandom(dim,bounds, ...genState.range, genState.density);

      genState.seed
        ? setSimState((prev) => ({ ...prev, seed: genState.seed, name: null }))
        : setSimState((prev) => ({ ...prev, seed: engineRef.current.seed, name: null }))

        
      rendererRef.current.volumeData = engineRef.current.grid
      rendererRef.current.render();
    };

    return (
      <EngineContext.Provider value={{   
        engine: engineRef.current, 
        renderer: rendererRef.current,
        uiState,
        setUiState,
        simState,
        setSimState,
        genState,
        setGenState,
        renderState,
        setRenderState
      }}>
        <div id = 'loading' className='loading' style={{ display: uiState.initialized ? 'none' : 'flex' }} >
          <div id = 'loader' className='loader'></div>
        </div> 
        <Topbar uiState={uiState} setUiState={setUiState} />
        <Sidebar isOpen={uiState.isSidebarOpen} />
              <ParameterModal
          visible={uiState.showParamOverlay}
          onClose={() => setUiState(prev => ({ ...prev, showParamOverlay: false }))}
        />
        <MainContent>
          <Menu
          handleGenerate = {handleGenerate}
          />
          <Simulation
            canvasRef={canvasRef}
            seed={simState.seed}
            simulationState={simState.params}
          />
        </MainContent>
      </EngineContext.Provider>
    );
  }
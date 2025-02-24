import React, { useContext, useState, useEffect, useRef } from 'react';
import { EngineContext } from '../App';

export const Simulation = ({ canvasRef}) => {
    const { uiState, setUiState, simState, setsimState, renderState, setRenderState } = useContext(EngineContext);
  return (
    <div id="simcont" className="simulation-container">
      {/* Main Canvas */}

      {/* Simulation UI */}
    <div id="sim" className="simulation">
        <div className="sim-topbar">
          <div className="seed-container">{simState.seed}</div>
          <div className="counter-container">
          <div className="subcounter-container">g {simState.generation}</div>
          <div className="subcounter-container"> {simState.timeCount} s</div>
          </div>
        </div>
      </div>
        <canvas 
          ref={canvasRef}
          className="canvas"
        />
      {/* Bottom Bar */}
      <div id="sim-bottombar" className="bottom-bar">
      <div id="playcontrol" className="play-controls">
        <label
            id="play-button"
            className="play-button"
          >
            <input
              type="checkbox"
              id="play-button-checkbox"
              className="play-button-checkbox"
              style={{ display: 'none' }} // or your preferred "hidden" technique
              checked={uiState.isRunning}
              onChange={() =>
                setUiState(prev => ({ ...prev, isRunning: !prev.isRunning }))
              }
            />
              <img
                src="/assets/images/startbutton.png"
                className="play-button-image"
                alt="Play/Pause"
              />
      
          </label>
          <button
            className="reset-button"
            id="reset"
            onClick={()=>setUiState(prev => ({ ...prev, reset: prev.reset=true }))}
          >
          </button>
        </div>
      </div>
    </div>
  );
};

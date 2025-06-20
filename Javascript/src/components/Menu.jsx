import React, { useContext, useState } from 'react';
import { EngineContext } from '../App';
import { useActiveState } from './useActiveState';
import { validateData } from './validation';
import { handleParamChange } from './handleParamChange';
import { GenerateDualRange, GenerateSingleRange } from './RangeInputs';
import { InfoModal } from './InfoModal';  

export const Menu = ({ handleGenerate }) => {
  const {
    uiState,
    setUiState,
    simState,
    setSimState,
    genState,
    setGenState,
  } = useContext(EngineContext);
  

  const { activeState, setActiveState } = useActiveState();
  const [showInfo, setShowInfo] = useState(false);


  const dimensionLabels = ['X', 'Y', 'Z'];
  const timeOptions = [1, 2, 3, 4, 5, 10, 20, 50, 100];

  const menumodes = {
    pregenerated: {
      headerText: 'Pregenerated Patterns',
      showIds: ['AnimalList'],
    },
    generate: {
      headerText: 'Create New Lenia',
      showIds: [
        'seed-input-container',
        'dimensions-container',
        'generate-container',
        'parameters-container',
        'generate-button',
      ],
    },
    edit: {
      headerText: 'Edit',
      showIds: ['dimensions-container', 'draw-container', 'parameters-container'],
    },
  };

  const { showIds } = menumodes[uiState.menumode] || {};
  const topbarColor =
    uiState.layout === 'row-main'
      ? 'hsl(var(--card))'
      : 'hsl(var(--background))';

  return (
      <>
    <div className="menu-container">
      <div className="menu-topbar" style={{ backgroundColor: topbarColor }}>
        <label className="subheader-label" style={{ margin: 'auto 0 0 3%' }}>
          {menumodes[uiState.menumode]?.headerText || 'Lenia'}
        {uiState.menumode != 'pregenerated' && (
          <button
            className="info-button"
            onClick={() => setShowInfo(true)}
            aria-label="Parameter info"
            >
            ?
          </button>
        )}
        </label>
        <div className="switch-button-container">
          <button
            className={`button switch-button ${
              uiState.menumode === 'generate' ? 'active' : ''
            }`}
            onClick={() =>
              setUiState((prev) => ({ ...prev, menumode: 'generate' }))
            }
          >
            Generate
          </button>
          <button
            className={`button switch-button ${
              uiState.menumode === 'pregenerated' ? 'active' : ''
            }`}
            onClick={() =>
              setUiState((prev) => ({ ...prev, menumode: 'pregenerated' }))
            }
          >
            Pregenerated
          </button>
        </div>
      </div>

      <div id="menu" className="menu-cont" style={{ overflowY: 'scroll' }}>
        <div
          id="seed-input-container"
          className="container generateswitch"
          style={{
            borderTop: 0,
            display: showIds?.includes('seed-input-container')
              ? 'block'
              : 'none',
          }}
        >
          <input
            id="seedinput"
            type="text"
            className="seed-input"
            value={activeState.seed || ''}
            onInput={(e) => (e.target.value = validateData(e.target.value, 'int', 28))}
            onChange={(e) =>
              handleParamChange(setActiveState, 'seed', e.target.value)
            }
          />
        </div>

        <div
          id="dimensions-container"
          className="container"
          style={{
            display: showIds?.includes('dimensions-container') ? 'block' : 'none',
          }}
        >
          {uiState.menumode === 'generate'
            ? (activeState.dimBounds || []).map((val, idx) => (
                <GenerateDualRange
                  key={idx}
                  label={dimensionLabels[idx] || `Dim ${idx}`}
                  min={0}
                  max={256}
                  step={1}
                  path="dimBounds"
                  index={idx}
                />
              ))
            : (activeState.dim || []).map((val, idx) => (
                <GenerateSingleRange
                  key={idx}
                  label={dimensionLabels[idx] || `Dim ${idx}`}
                  min={0}
                  max={256}
                  step={1}
                  path="dim"
                  index={idx}
                />
              ))}
        </div>

        <div
          id="generate-container"
          className="container"
          style={{
            display: showIds?.includes('generate-container') ? 'block' : 'none',
          }}
        >
          <div className="subheader">
            <label className="subheader-label" style={{ fontSize: '2vh' }}>
              Random
              <label className="sub-text">
                Set the Range and Density of Values
              </label>
            </label>
          </div>
          {uiState.menumode === 'generate' && (
            <>
              <GenerateDualRange
                label="Range"
                min={0}
                max={1}
                step={0.001}
                path="range"
              />
              <GenerateSingleRange
                label="Density"
                min={0}
                max={1}
                step={0.001}
                path="density"
              />
            </>
          )}
        </div>

        <div
          id="parameters-container"
          className="container"
          style={{
            display: showIds?.includes('parameters-container') ? 'block' : 'none',
          }}
        >
          <div className="subcontainer">
            <div className="parameter-row time-row">
              <label className="paras-label">Time</label>
              <div className="time-bar">
                {timeOptions.map((t) => (
                  <button
                    key={t}
                    className={`button ${
                      activeState.params.T === t ? 'active' : ''
                    }`}
                    onClick={() =>
                      handleParamChange(setActiveState, 'T', t, 'params')
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input
                type="text"
                className="para-input"
                value={activeState.params.T}
                onChange={(e) => {
                  const numeric = parseInt(e.target.value, 10);
                  handleParamChange(
                    setActiveState,
                    'T',
                    isNaN(numeric) ? 0 : numeric,
                    'params'
                  );
                }}
              />
            </div>
          </div>

          <div className="subcontainer">
            <div className="subheader">
              <label className="subheader-label" style={{ fontSize: '2vh' }}>
                Kernel
                <label className="sub-text">Edit parameters</label>
              </label>

              <div className="parameter-button-container">
                Radius:
                <div className="parameter-buttons">
                  <button
                    className="button button-dark"
                    onClick={() =>
                      handleParamChange(
                        setActiveState,
                        'R',
                        Math.max(0, activeState.params.R - 1),
                        'params'
                      )
                    }
                  >
                    -
                  </button>
                  <div>{activeState.params.R}</div>
                  <button
                    className="button button-dark"
                    onClick={() =>
                      handleParamChange(
                        setActiveState,
                        'R',
                        activeState.params.R + 1,
                        'params'
                      )
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <GenerateSingleRange
              label="μ"
              min={0}
              max={1}
              step={0.001}
              path="m"
              subpath="params"
            />
            <GenerateSingleRange
              label="σ"
              min={0}
              max={1}
              step={0.001}
              path="s"
              subpath="params"
            />

            <div className="subcontainer">
              <div className="subheader">
                <label
                  className="paras-label"
                  style={{ fontWeight: 'normal', borderRight: 'none' }}
                >
                  β
                </label>
                <div className="parameter-button-container">
                  <div className="parameter-buttons">
                    <button
                      className="button button-dark"
                      onClick={() => {
                        if (activeState.params.b.length > 1) {
                          const newArr = activeState.params.b.slice(0, -1);
                          handleParamChange(setActiveState, 'b', newArr, 'params');
                        }
                      }}
                    >
                      -
                    </button>
                    <div>{activeState.params.b.length}</div>
                    <button
                      className="button button-dark"
                      onClick={() => {
                        const newArr = [...activeState.params.b, 0];
                        handleParamChange(setActiveState, 'b', newArr, 'params');
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <div id="bcontainer" style={{ marginLeft: '2%' }}>
                {activeState.params.b.map((val, idx) => (
                  <GenerateSingleRange
                    key={idx}
                    label={idx}
                    min={0}
                    max={1}
                    step={0.001}
                    path="b"
                    subpath="params"
                    index={idx}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <ul
          id="AnimalList"
          className="animalList"
          style={{
            display: showIds?.includes('AnimalList') ? 'block' : 'none',
          }}
        ></ul>

        <button
          id="generate-button"
          className="generate-button button"
          style={{
            display: showIds?.includes('generate-button') ? 'block' : 'none',
          }}
          onClick={() => {
            handleGenerate();
          }}
        >
          Generate
        </button>
      </div>
    </div>
      <InfoModal visible={showInfo} onClose={() => setShowInfo(false)} />
    </>
  );
};

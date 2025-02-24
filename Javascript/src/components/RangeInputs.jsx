import React, { useState, useEffect, useRef } from 'react';
import { useActiveState } from './useActiveState';
import { validateData, validateInput, getDecimalPlaces } from './validation';
import { handleParamChange } from './handleParamChange';

/**
 * Custom hook to track mouse down state
 * @returns {Object} Mouse down state and handlers
 */
const useMouseDown = () => {
  const isMouseDown = useRef(false);
  const handleMouseDown = () => (isMouseDown.current = true);
  const handleMouseUp = () => (isMouseDown.current = false);
  return { isMouseDown, handleMouseDown, handleMouseUp };
};

/**
 * Custom hook to retrieve current value from active state
 * @param {string} path - Path to the value in active state
 * @param {string} [subpath] - Optional nested path
 * @param {number} [index] - Optional array index
 * @returns {*} Current value from active state
 */
const useCurrentValue = (path, subpath, index) => {
  const { activeState } = useActiveState();
  let value = subpath ? activeState[subpath][path] : activeState[path];
  if (typeof index === 'number' && Array.isArray(value)) {
    value = value[index];
  }
  return value;
};

/**
 * Custom hook to handle step configuration
 * @param {number} step - Step value
 * @param {number} max - Maximum value
 * @returns {Object} Step configuration
 */
const useStepConfig = (step, max) => {
  const isInt = Number.isInteger(step);
  const slice = isInt ? max.toString().length : getDecimalPlaces(step);
  const parseFn = isInt ? parseInt : parseFloat;
  return { isInt, slice, parseFn };
};

/**
 * Reusable input component for parameter values
 * @param {Object} props - Component props
 */
const ParamInput = ({ 
  value, 
  isInt, 
  slice, 
  parseFn, 
  min, 
  max, 
  step, 
  onCommit 
}) => (
  <input
    className="para-input"
    value={parseFn(value.toString().slice(0, slice))}
    style={{ width: slice + 1 + 'ch' }}
    onInput={(e) => {
      const cleaned = validateData(e.target.value, isInt ? 'int' : 'float', slice);
      onCommit(cleaned, false);
    }}
    onBlur={(e) => {
      validateInput(e.target, isInt ? 'int' : 'float', [min, max, step]);
      const finalValue = parseFn(e.target.value);
      onCommit(finalValue, true);
    }}
  />
);

/**
 * Dual range input component
 * @param {Object} props - Component props
 */
const DualRangeInput = ({ 
  type, 
  value, 
  constraint,
  ...props 
}) => {
  const { isMouseDown, handleMouseDown, handleMouseUp } = useMouseDown();
  
  const handleInput = (e) => {
    const newVal = props.parseFn(e.target.value);
    props.onValueChange(type === 'min' ? 
      Math.min(newVal, constraint) : 
      Math.max(newVal, constraint)
    );
  };

  return (
    <input
      type="range"
      className={`range ${type}`}
      value={value}
      onInput={handleInput}
      onMouseDown={handleMouseDown}
      onMouseUp={() => {
        handleMouseUp();
        props.onCommit();
      }}
      onChange={() => !isMouseDown.current && props.onCommit()}
      {...props}
    />
  );
};

/**
 * Dual range control component for [min, max] values
 * @param {Object} props - Component props
 */
export function GenerateDualRange({
  label,
  min,
  max,
  step,
  path,
  subpath = null,
  index = null
}) {
  const currentVal = useCurrentValue(path, subpath, index);
  const [localMin, localMax] = currentVal;
  const { isInt, slice, parseFn } = useStepConfig(step, max);
  const { setActiveState } = useActiveState();
  const [valMin, setValMin] = useState(localMin);
  const [valMax, setValMax] = useState(localMax);

  useEffect(() => {
    setValMin(localMin);
    setValMax(localMax);
  }, [localMin, localMax]);

  const commitValues = () => handleParamChange(
    setActiveState, path, [valMin, valMax], subpath, index
  );

  return (
    <div className="parameter-row">
      <label className="paras-label">{label}</label>
      <div className="range-container">
        <DualRangeInput
          type="min"
          value={valMin}
          min={min}
          max={max}
          step={step}
          parseFn={parseFn}
          constraint={valMax}
          onValueChange={setValMin}
          onCommit={commitValues}
        />
        <DualRangeInput
          type="max"
          value={valMax}
          min={min}
          max={max}
          step={step}
          parseFn={parseFn}
          constraint={valMin}
          onValueChange={setValMax}
          onCommit={commitValues}
        />
      </div>
      <div className="genRangeInputContainer">
        <ParamInput
          value={valMin}
          isInt={isInt}
          slice={slice}
          parseFn={parseFn}
          min={min}
          max={max}
          step={step}
          onCommit={(val, shouldCommit) => {
            setValMin(val);
            shouldCommit && commitValues();
          }}
        />
        <span>,</span>
        <ParamInput
          value={valMax}
          isInt={isInt}
          slice={slice}
          parseFn={parseFn}
          min={min}
          max={max}
          step={step}
          onCommit={(val, shouldCommit) => {
            setValMax(val);
            shouldCommit && commitValues();
          }}
        />
      </div>
    </div>
  );
}

/**
 * Single range control component
 * @param {Object} props - Component props
 */
export function GenerateSingleRange({
  label,
  min,
  max,
  step,
  path,
  subpath = null,
  index = null
}) {
  const currentVal = useCurrentValue(path, subpath, index);
  const { isInt, slice, parseFn } = useStepConfig(step, max);
  const { setActiveState } = useActiveState();
  const { isMouseDown, handleMouseDown, handleMouseUp } = useMouseDown();
  const [localValue, setLocalValue] = useState(currentVal);

  useEffect(() => {
    setLocalValue(currentVal);
  }, [currentVal]);

  const commitValue = (value) => handleParamChange(
    setActiveState, path, parseFn(value), subpath, index
  );

  return (
    <div className="parameter-row">
      <label className="paras-label">{label}</label>
      <input
        type="range"
        className="single-range"
        value={localValue}
        min={min}
        max={max}
        step={step}
        onInput={(e) => setLocalValue(e.target.value)}
        onMouseDown={handleMouseDown}
        onMouseUp={(e) => {
          handleMouseUp();
          commitValue(e.target.value);
        }}
        onChange={(e) => !isMouseDown.current && commitValue(e.target.value)}
      />
      <ParamInput
        value={localValue}
        isInt={isInt}
        slice={slice}
        parseFn={parseFn}
        min={min}
        max={max}
        step={step}
        onCommit={(val) => commitValue(val)}
      />
    </div>
  );
}
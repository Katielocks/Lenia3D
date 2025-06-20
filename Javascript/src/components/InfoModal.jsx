import React, { useContext, useEffect } from "react";
import { EngineContext } from "../App";

/**
 * InfoModal - Detailed guide explaining simulation parameters.
 * Props:
 *  • visible (boolean) - controls modal visibility
 *  • onClose (function) - handler to close the modal
 */
export const InfoModal = ({ visible, onClose }) => {
  const { uiState } = useContext(EngineContext);

  // Close on Escape key
  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="info-overlay" onClick={onClose}>
      <div className="info-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="close-button"
          aria-label="Close parameter guide"
          onClick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h2>Simulation Parameters Guide</h2>

        {uiState.menumode === "generate" ? (
          <>
            <h3>Seed Input</h3>
            <p>
              <strong>Seed</strong>: A numeric value used to initialize the random number generator. If left blank, a new one is generated automatically. The current seed is shown at the top-left of the simulation window.
            </p>

            <h3>Random Generation Settings</h3>
            <ul>
              <li>
                <strong>Range</strong>: Defines minimum and maximum initial values.
              </li>
              <li>
                <strong>Density</strong>: Probability of each cell starting as active.
              </li>
              <li>
                <strong>X, Y, Z Dimensions</strong>: Grid sizes. Lower handle adjusts the initial active area; upper handle adjusts total simulation space.
              </li>
            </ul>
          </>
        ) : (
          <>
            <h3>Grid Dimensions</h3>
            <p>
              <strong>X, Y, Z</strong>: Specifies the width, height, and depth of the simulation space.
            </p>
          </>
        )}

        <h3>Time Settings</h3>
        <p>
          <strong>Time (T)</strong>: Number of simulation steps per second.
        </p>

        <h3>Kernel Parameters</h3>
        <ul>
          <li>
            <strong>Radius (R)</strong>: Defines the size of the neighborhood considered around each cell.
          </li>
          <li>
            <strong>Mean (μ)</strong>: Average growth value influencing cell activation.
          </li>
          <li>
            <strong>Standard Deviation (σ)</strong>: Variability in the growth rate.
          </li>
          <li>
            <strong>Shell Coefficients (β)</strong>: Influence weights for surrounding shells, e.g., [0, 1, 2, 3].
          </li>
        </ul>
      </div>
    </div>
  );
};

import React, { useContext } from "react";
import { EngineContext } from "../App";


/**
 * InfoModal - shows a short parameter guide.
 * Props:
 *  • visible (boolean) - whether the modal is open
 *  • onClose (function) - called when the user dismisses the modal
 */
export const InfoModal = ({ visible, onClose }) => {
  const { uiState } = useContext(EngineContext);  
  if (!visible) return null;

  return (
    <div
      className="info-overlay"
      onClick={onClose /* close when the backdrop is clicked */}
    >
      <div
        className="info-modal"
        onClick={(e) => e.stopPropagation() /* keep clicks inside from closing */}
      >
        {/* Inline “X” icon in the top‑right */}
        <button
          className="close-button"
          aria-label="Close information modal"
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

        <h2>Parameter Guide</h2>

        {uiState.menumode === 'generate' ? (
          <>
            <p>
              <strong>Random Generation</strong>
            </p>
            <ul>
              <li>
                <strong>Range</strong> - minimum and maximum starting values.
              </li>
              <li>
                <strong>Density</strong> - probability of a cell being active.
              </li>
              <li>
                <strong>X, Y, Z</strong> - grid dimensions, lower handle is dimension of starting cube, upper handle is the dimension of game space.
              </li>
            </ul>
          </>
        ) : (
          <>
            <p>
              <strong>Dimensions</strong>
            </p>
            <p>
              <strong>X, Y, Z</strong> – grid dimensions.
            </p>
          </>
        )}

        <p>
          <strong>Time</strong> (T) - steps per second.
        </p>

        <p>
          <strong>Kernel</strong>
        </p>
        <ul>
          <li>
            <strong>Radius</strong> (R) - neighbourhood size. Example: 20
          </li>
          <li>
            <strong>&mu;</strong> (m) - growth mean.
          </li>
          <li>
            <strong>&sigma;</strong> (s) - growth standard deviation.
          </li>
          <li>
            <strong>&beta;</strong> (b) - shell coefficients, e.g. [0, 1, 2, 3]
          </li>
        </ul>
      </div>
    </div>
  );
};

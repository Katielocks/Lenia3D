import React from 'react';

export const InfoModal = ({ visible, onClose }) => {
  if (!visible) return null;
  return (
    <div className="info-overlay" onClick={onClose}>
      <div className="info-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Parameter Guide</h2>
        <p><strong>X, Y, Z</strong> – grid dimensions.</p>
        <p><strong>Time</strong> (T) – steps per second.</p>
        <p><strong>Kernel</strong></p>
        <ul>
          <li><strong>Radius</strong> (R) – neighbourhood size. Example: 20</li>
          <li><strong>&mu;</strong> (m) – growth mean.</li>
          <li><strong>&sigma;</strong> (s) – growth standard deviation.</li>
          <li><strong>&beta;</strong> (b) – shell coefficients, e.g. [0, 1, 2, 3]</li>
        </ul>
        <button className="button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

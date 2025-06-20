import React from 'react';

export const ParameterModal = ({ visible, onClose }) => {
  if (!visible) return null;
  return (
    <div className="param-overlay" onClick={onClose}>
      <div className="param-modal" onClick={(e) => e.stopPropagation()}>
        <div className="param-modal-header">
          <h2>Parameter Guide</h2>
          <button className="param-close" onClick={onClose}>×</button>
        </div>
        <p><strong>X, Y, Z</strong> – grid dimensions.</p>
        <p><strong>Time</strong> (T) – steps per second.</p>
        <p><strong>Kernel</strong></p>
        <p><strong>Random Generation</strong></p>
        <ul>
          <li><strong>Range</strong> – minimum and maximum starting values.</li>
          <li><strong>Density</strong> – probability of a cell being active.</li>
        </ul>
        <ul>
          <li><strong>Radius</strong> (R) – neighbourhood size. Example: 20</li>
          <li><strong>&mu;</strong> (m) – growth mean.</li>
          <li><strong>&sigma;</strong> (s) – growth standard deviation.</li>
          <li><strong>&beta;</strong> (b) – shell coefficients, e.g. [0, 1, 2, 3]</li>
        </ul>
      </div>
    </div>
  );
};
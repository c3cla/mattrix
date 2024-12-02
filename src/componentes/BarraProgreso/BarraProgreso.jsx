import React from 'react';
import './BarraProgreso.css';

export const BarraProgreso = ({ progreso }) => {
  return (
    <div className="barra-progreso">
      <div className="progreso" style={{ width: `${progreso}%` }}></div>
    </div>
  );
};

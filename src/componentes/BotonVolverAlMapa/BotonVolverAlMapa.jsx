// src/componentes/BotonVolverAlMapa.js

import React from 'react';
import './BotonVolverAlMapa.css'; // Asegúrate de crear este archivo para los estilos

const BotonVolverAlMapa = ({ onVolver }) => {
  return (
    <button className="boton-volver" onClick={onVolver}>
      Volver al Mapa
    </button>
  );
};

export default BotonVolverAlMapa;

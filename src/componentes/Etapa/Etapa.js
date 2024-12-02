// Etapa.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Pelotas from './Pelotas';
import TerminosPareados from './TerminosPareados';
// Importa otros componentes de preguntas si los tienes

const Etapa = ({ match }) => {
  const [etapa, setEtapa] = useState(null);
  const [preguntas, setPreguntas] = useState([]);

  useEffect(() => {
    const etapaId = match.params.id; // Suponiendo que la ruta incluye el ID de la etapa

    // Obtener la información de la etapa
    axios.get(`/api/etapas/${etapaId}/`)
      .then(response => {
        setEtapa(response.data);
      })
      .catch(error => {
        console.error('Error al obtener la etapa:', error);
      });

    // Obtener las preguntas de la etapa
    axios.get(`/api/etapas/${etapaId}/preguntas/`)
      .then(response => {
        setPreguntas(response.data);
      })
      .catch(error => {
        console.error('Error al obtener las preguntas:', error);
      });

  }, [match.params.id]);

  if (!etapa) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <h2>{etapa.nombre}</h2>
      <p>{etapa.descripcion}</p>

      {preguntas.map((pregunta) => (
        <div key={pregunta.id_pregunta}>
          {renderizarPregunta(pregunta)}
        </div>
      ))}
    </div>
  );
};

const renderizarPregunta = (pregunta) => {
  switch (pregunta.tipo) {
    case 'pelotas':
      return <Pelotas pregunta={pregunta} />;
    case 'terminos_pareados':
      return <TerminosPareados pregunta={pregunta} />;
    // Agrega más casos para otros tipos de preguntas
    default:
      return <div>Tipo de pregunta no reconocido</div>;
  }
};

export default Etapa;

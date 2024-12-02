import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerEtapasPorNivel, obtenerEtapasCompletadasPorUsuario } from '../../api';
import './MapaEtapas.css';

import etapaActualImg from '../MostrarNiveles/assets/etapa-actual.png';
import etapaBloqueadaImg from '../MostrarNiveles/assets/etapa-bloqueada.png';
import etapaCompletadaImg from '../MostrarNiveles/assets/etapa-completada.png';
import fondoMapaImg from '../MostrarNiveles/assets/fondo-mapa.png';

const MapaEtapas = () => {
  const { id_nivel } = useParams();
  const navigate = useNavigate();

  const [etapas, setEtapas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedStages, setCompletedStages] = useState([]);
  const [animatingStage, setAnimatingStage] = useState(null);

  useEffect(() => {
    localStorage.setItem("id_nivel", id_nivel);
    const fetchEtapas = async () => {
      try {
        const data = await obtenerEtapasPorNivel(id_nivel);
        setEtapas(data);
      } catch (err) {
        setError('Error al cargar las etapas.');
      } finally {
        setLoading(false);
      }
    };

    const fetchCompletedStages = async () => {
      try {
        const completedData = await obtenerEtapasCompletadasPorUsuario(id_nivel);
        setCompletedStages(completedData.map(etapa => etapa.id_etapa));
      } catch (err) {
        setError('Error al cargar las etapas completadas.');
      }
    };

    fetchEtapas();
    fetchCompletedStages();
  }, [id_nivel]);

  const handleEtapaClick = (etapa) => {
    const etapaIndex = etapas.findIndex(e => e.id_etapa === etapa.id_etapa);
    const etapaAnterior = etapas[etapaIndex - 1];

    if (etapaAnterior && !completedStages.includes(etapaAnterior.id_etapa)) {
      alert(`Necesitas completar la etapa anterior (${etapaAnterior.nombre}) para acceder a esta etapa.`);
      return;
    }

    setAnimatingStage(etapa.id_etapa);
    navigate(`/etapa/${etapa.id_etapa}`, { state: { componente: etapa.componente } });
  };

  const obtenerClaseEtapa = (etapa) => {
    if (completedStages.includes(etapa.id_etapa)) {
      return "etapa etapa-completada";
    }

    const currentStage = etapas.find(stage => !completedStages.includes(stage.id_etapa));
    if (currentStage && etapa.id_etapa === currentStage.id_etapa) {
      return "etapa proxima-etapa";
    }

    return "etapa";
  };

  const obtenerImagenEtapa = (etapa) => {
    if (completedStages.includes(etapa.id_etapa)) {
      return etapaCompletadaImg;
    }

    const currentStage = etapas.find(stage => !completedStages.includes(stage.id_etapa));
    if (currentStage && etapa.id_etapa === currentStage.id_etapa) {
      return etapaActualImg;
    }

    return etapaBloqueadaImg;
  };

  if (loading) {
    return <p>Cargando etapas...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (etapas.length === 0) {
    return <p>No hay etapas para este nivel.</p>;
  }

  const handleVolverAlMenu = () => {
    navigate('/estudiante'); 
  };

  return (
    <div className="mapa-niveles">
      <div className="barra-lateral">
        <h1>{etapas[0].nivel.nombre}</h1>
        <button onClick={handleVolverAlMenu}>Volver al menú</button>
      </div>
    
      <div className="mapa-container">
        
        <div className="mapa">
          <img src={fondoMapaImg} alt="Mapa de fondo" className="fondo-mapa" />

          <svg className="lineas-camino" xmlns="http://www.w3.org/2000/svg">
            {etapas.map((etapa, index) => {
              if (index < etapas.length - 1) {
                const siguienteEtapa = etapas[index + 1];
                return (
                  <line
                    key={`linea-${etapa.id_etapa}`}
                    x1={`${etapa.posicion_x}px`}
                    y1={`${etapa.posicion_y}px`}
                    x2={`${siguienteEtapa.posicion_x}px`}
                    y2={`${siguienteEtapa.posicion_y}px`}
                    stroke="url(#gradiente)"
                    strokeWidth="2"
                  />
                );
              }
              return null;
            })}
            <defs>
              <linearGradient id="gradiente" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: 'black', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: 'purple', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'blue', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
          </svg>

          {etapas.map((etapa) => (
            <div
              key={etapa.id_etapa}
              className={obtenerClaseEtapa(etapa)}
              style={{
                left: `${etapa.posicion_x}px`,
                top: `${etapa.posicion_y}px`,
              }}
              onClick={() => handleEtapaClick(etapa)}
              tabIndex="0"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleEtapaClick(etapa);
                }
              }}
              aria-label={`Selecciona la etapa ${etapa.nombre}`}
            >
              <img
                src={obtenerImagenEtapa(etapa)}
                alt={`Etapa ${etapa.nombre}`}
                className="imagen-etapa"
              />
              <div className="tooltip">
                <h3>{etapa.nombre}</h3>
                <p>{etapa.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapaEtapas;

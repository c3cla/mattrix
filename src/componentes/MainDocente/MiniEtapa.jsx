import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './MiniEtapa.css';
import * as Componentes from '../indice';

const MiniEtapa = ({ id_etapa_prop, mostrarBotonVolver = true }) => {
  const { id_etapa } = useParams();
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [ComponenteSeleccionado, setComponenteSeleccionado] = useState(null);

  const [etapasCompletadas, setEtapasCompletadas] = useState(() => {
    const almacenadas = localStorage.getItem('etapasCompletadas');
    return almacenadas ? JSON.parse(almacenadas) : [];
  });

  useEffect(() => {
    localStorage.setItem('etapasCompletadas', JSON.stringify(etapasCompletadas));
  }, [etapasCompletadas]);

  useEffect(() => {
    const obtenerEtapa = async () => {
      try {
        const idEtapa = id_etapa_prop || id_etapa;
        const respuesta = await fetch(`http://127.0.0.1:8000/api/etapas/${idEtapa}/`);
        if (!respuesta.ok) {
          throw new Error('Etapa no encontrada');
        }
        const datos = await respuesta.json();
        setEtapa(datos);
      } catch (error) {
        setError('Error al cargar la etapa.');
      } finally {
        setCargando(false);
      }
    };

    obtenerEtapa();
  }, [id_etapa, id_etapa_prop]);

  useEffect(() => {
    if (etapa && etapa.componente) {
      const componenteNombre = etapa.componente;
      const Componente = Componentes[componenteNombre];
      if (Componente) {
        setComponenteSeleccionado(() => Componente);
      } else {
        setError('Componente no encontrado.');
      }
    }
  }, [etapa]);

  const marcarEtapaComoCompletada = async () => {
    try {
      const token = localStorage.getItem('token');
      const respuesta = await fetch(`https://profeclauvidelas.cl/backend/api/etapas/${etapa.id_etapa}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completado: true }),
      });

      if (!respuesta.ok) {
        throw new Error('Error al completar la etapa.');
      }

      setEtapasCompletadas((prev) => [...prev, etapa.id_etapa]);

      // Solo navegar si mostrarBotonVolver es true
      if (mostrarBotonVolver) {
        navigate('/nivel/' + etapa.id_nivel, { state: { id_etapa_completada: etapa.id_etapa } });
      }
    } catch (error) {
      setError('No se pudo completar la etapa.');
    }
  };

  if (cargando) {
    return <p>Cargando etapa...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!etapa) {
    return <p>Etapa no encontrada.</p>;
  }

  return (
    <div className="detalles-etapa-container">
      <h1>{etapa.nombre}</h1>
      <p>{etapa.descripcion}</p>
      {mostrarBotonVolver && (
        <button onClick={() => navigate('/nivel/' + etapa.id_nivel)}>Volver al Mapa</button>
      )}

      {ComponenteSeleccionado ? (
        <Suspense fallback={<div>Cargando componente...</div>}>
          <ComponenteSeleccionado etapa={etapa} marcarCompletada={marcarEtapaComoCompletada} />
        </Suspense>
      ) : (
        <p>No hay un componente asociado a esta etapa.</p>
      )}
    </div>
  );
};

export default MiniEtapa;

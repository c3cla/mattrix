import React, { useState, useEffect, useRef } from 'react';
import { BarraProgreso, Resumen } from "../indice"; // Asegúrate de que esta ruta es correcta
import './ExperimentoEvento.css';
import { obtenerTerminosPareados } from '../../api'; // Asegúrate de que esta ruta es correcta
import { useNavigate } from 'react-router-dom'; // Importar useNavigate para redirección

const ExperimentoEvento = ({ etapa, marcarCompletada }) => {
  const id_etapa = etapa.id_etapa;
  const [experimentos, setExperimentos] = useState([]); // Array de 6 conceptos
  const [eventos, setEventos] = useState([]); // Array de 6 definiciones
  const [indiceEventoActual, setIndiceEventoActual] = useState(null); // Índice del evento actual en el array eventos
  const [progreso, setProgreso] = useState(0);
  const [conexion, setConexion] = useState(null); // { from: {x, y}, to: {x, y}, indice }
  const [temporizador, setTemporizador] = useState(0);
  const [modalError, setModalError] = useState(false);
  const [resultados, setResultados] = useState([]); // Array de resultados por pregunta
  const [tiempoInicio, setTiempoInicio] = useState(null); // Tiempo de inicio de la etapa
  const [mostrarResumen, setMostrarResumen] = useState(false); // Controla la visualización del resumen

  const navegar = useNavigate(); // Hook para redirección

  // Referencias para almacenar posiciones y velocidades
  const posicionesRef = useRef([]);
  const velocidadesRef = useRef([]);

  // Referencias para los elementos del DOM
  const conceptosRefs = useRef([]);
  const eventoRef = useRef(null); // Ref para el evento estático
  const contenedorRef = useRef(null); // Ref para el contenedor de conceptos

  // Referencia para el intervalo del temporizador
  const intervaloTemporizadorRef = useRef(null);

  // Cargar los experimentos al montar el componente
  useEffect(() => {
    cargarExperimentos();
  }, []);

  // Función para cargar 6 experimentos aleatorios
  const cargarExperimentos = async () => {
    try {
      const todosTerminos = await obtenerTerminosPareados("experimento");
      console.log("Todos los términos:", todosTerminos);
      if (todosTerminos.length < 6) {
        console.error("No hay suficientes términos para cargar 6 experimentos.");
        return;
      }

      // Mezclar y seleccionar 6 términos aleatorios
      const mezclados = todosTerminos.sort(() => 0.5 - Math.random()).slice(0, 6);

      // Crear dos arreglos: uno para conceptos y otro para definiciones
      const conceptos = mezclados.map((termino) => termino.concepto);
      const definiciones = mezclados.map((termino) => termino.definicion);

      // Inicializar posiciones para cada concepto
      mezclados.forEach((termino, indice) => {
        posicionesRef.current[indice] = {
          top: Math.random() * 80, // Posición inicial top (%)
          left: Math.random() * 80, // Posición inicial left (%)
        };
        velocidadesRef.current[indice] = {
          dx: (Math.random() * 0.4 - 0.2), // Velocidad horizontal entre -0.2 y 0.2% por frame
          dy: (Math.random() * 0.4 - 0.2), // Velocidad vertical entre -0.2 y 0.2% por frame
        };
      });

      setExperimentos(conceptos);
      setEventos(definiciones);

      // Seleccionar un evento inicial aleatorio
      const indiceEventoInicial = Math.floor(Math.random() * definiciones.length);
      setIndiceEventoActual(indiceEventoInicial);

      // Inicializar tiempo de inicio
      setTiempoInicio(Date.now());
    } catch (error) {
      console.error("Error al obtener términos pareados:", error);
    }
  };

  // Implementar la animación de movimiento
  useEffect(() => {
    if (experimentos.length === 0) return;

    let idAnimacion;

    const animar = () => {
      experimentos.forEach((_, indice) => {
        // Si este experimento está conectado, no actualizar su posición
        if (conexion && conexion.indice === indice) return;

        let pos = posicionesRef.current[indice];
        let vel = velocidadesRef.current[indice];

        if (!pos || !vel) return; // Asegurar que pos y vel existen

        // Actualizar posiciones
        pos.top += vel.dy;
        pos.left += vel.dx;

        // Introducir cambios aleatorios en la dirección
        const probCambiarDireccion = 0.02; // 2% de probabilidad de cambiar dirección cada frame
        if (Math.random() < probCambiarDireccion) {
          vel.dy += (Math.random() * 0.2 - 0.1); // Cambia la velocidad ligeramente
          vel.dx += (Math.random() * 0.2 - 0.1);
          // Limitar la velocidad para evitar movimientos demasiado rápidos
          vel.dy = Math.max(-0.3, Math.min(vel.dy, 0.3));
          vel.dx = Math.max(-0.3, Math.min(vel.dx, 0.3));
        }

        // Verificar límites del contenedor y rebotar si es necesario
        if (pos.top <= 0 || pos.top >= 80) {
          vel.dy = -vel.dy;
          pos.top = Math.max(0, Math.min(pos.top, 80));
        }
        if (pos.left <= 0 || pos.left >= 80) {
          vel.dx = -vel.dx;
          pos.left = Math.max(0, Math.min(pos.left, 80));
        }

        // Aplicar nuevas posiciones al elemento del DOM
        const elemento = conceptosRefs.current[indice];
        if (elemento) {
          elemento.style.top = `${pos.top}%`;
          elemento.style.left = `${pos.left}%`;
        }
      });

      // Solicitar el siguiente frame de animación
      idAnimacion = requestAnimationFrame(animar);
    };

    // Iniciar la animación
    animar();

    // Limpiar al desmontar el componente
    return () => cancelAnimationFrame(idAnimacion);
  }, [experimentos, conexion]);

  // Función para manejar el clic en el evento
  const manejarClickEvento = () => {
    if (conexion) {
      alert("Ya hay una conexión establecida. Haz clic en el experimento conectado para eliminarla.");
      return;
    }
    alert("Haz clic en un experimento para conectar con el evento.");
  };

  // Función para manejar el clic en un experimento
  const manejarClickConcepto = (indice) => {
    if (indiceEventoActual === null) return;

    // Si ya hay una conexión
    if (conexion) {
      // Si se hace clic en el mismo experimento conectado, eliminar la conexión
      if (conexion.indice === indice) {
        setConexion(null);
        // Remover la clase 'connected' para desestilizar el experimento
        const elemento = conceptosRefs.current[indice];
        if (elemento) {
          elemento.classList.remove('connected');
        }
        return;
      } else {
        // Si se hace clic en otro experimento mientras ya hay una conexión, no hacer nada
        alert("Solo puedes tener una conexión a la vez.");
        return;
      }
    }

    // Obtener las coordenadas del evento y del experimento
    const elementoEvento = eventoRef.current;
    const elementoConcepto = conceptosRefs.current[indice];
    const elementoContenedor = contenedorRef.current;

    if (!elementoEvento || !elementoConcepto || !elementoContenedor) return;

    const rectEvento = elementoEvento.getBoundingClientRect();
    const rectConcepto = elementoConcepto.getBoundingClientRect();
    const rectContenedor = elementoContenedor.getBoundingClientRect();

    // Calcular el centro de ambos elementos relativos al contenedor
    const centroEvento = {
      x: rectEvento.left + rectEvento.width / 2 - rectContenedor.left,
      y: rectEvento.top + rectEvento.height / 2 - rectContenedor.top,
    };

    const centroConcepto = {
      x: rectConcepto.left + rectConcepto.width / 2 - rectContenedor.left,
      y: rectConcepto.top + rectConcepto.height / 2 - rectContenedor.top,
    };

    // Establecer la nueva conexión
    setConexion({ from: centroEvento, to: centroConcepto, indice });

    // Añadir una clase para destacar el experimento conectado
    const elemento = conceptosRefs.current[indice];
    if (elemento) {
      elemento.classList.add('connected');
    }
  };

  // Implementar el temporizador
  useEffect(() => {
    // Solo iniciar el temporizador si no se está mostrando el resumen
    if (!mostrarResumen) {
      intervaloTemporizadorRef.current = setInterval(() => {
        setTemporizador(prevTiempo => prevTiempo + 1);
      }, 1000); // Incrementa cada segundo
    }

    // Limpiar el intervalo cuando se desmonta el componente o cuando se muestra el resumen
    return () => {
      if (intervaloTemporizadorRef.current) {
        clearInterval(intervaloTemporizadorRef.current);
        intervaloTemporizadorRef.current = null;
      }
    };
  }, [mostrarResumen]);

  // Función para formatear el tiempo en mm'ss
  const formatearTiempo = (totalSegundos) => {
    const minutos = Math.floor(totalSegundos / 60);
    const segundos = totalSegundos % 60;
    const minutosFormateados = String(minutos).padStart(2, '0');
    const segundosFormateados = String(segundos).padStart(2, '0');
    return `${minutosFormateados}'${segundosFormateados}`;
  };

  // Función para manejar el clic en "Comprobar"
  const manejarComprobar = () => {
    if (indiceEventoActual === null) {
      alert("No hay un evento activo para comprobar.");
      return;
    }

    if (!conexion) {
      alert("No hay una conexión para comprobar.");
      return;
    }

    const esCorrecto = conexion.indice === indiceEventoActual;

    if (esCorrecto) {
      // Respuesta correcta
      setProgreso(prev => Math.min(prev + (100 / 6), 100)); // Cada respuesta correcta incrementa ~16.66%

      // Eliminar la conexión
      setConexion(null);

      // Remover la clase 'connected' del experimento
      const elemento = conceptosRefs.current[conexion.indice];
      if (elemento) {
        elemento.classList.remove('connected');
      }

      // Ocultar el experimento correcto
      setExperimentos(prev => prev.filter((_, idx) => idx !== conexion.indice));
      setEventos(prev => prev.filter((_, idx) => idx !== indiceEventoActual));

      // Seleccionar un nuevo evento si quedan definiciones
      if (eventos.length > 1) { // Ya que una se va a eliminar
        const nuevosEventos = eventos.filter((_, idx) => idx !== indiceEventoActual);
        const nuevoIndiceEvento = Math.floor(Math.random() * nuevosEventos.length);
        setIndiceEventoActual(nuevoIndiceEvento);
      } else {
        // Finalizar la etapa y mostrar el resumen
        setIndiceEventoActual(null);
        
        // Registrar el resultado total
        setResultados([{ correcta: true, tiempo: temporizador }]);
        
        setMostrarResumen(true);
      }
    } else {
      // Respuesta incorrecta
      setModalError(true);
    }
  };

  // Función para manejar cerrar el modal
  const manejarCerrarModal = () => {
    setModalError(false);
    // Resetear la conexión para permitir intentar nuevamente
    if (conexion) {
      const elemento = conceptosRefs.current[conexion.indice];
      if (elemento) {
        elemento.classList.remove('connected');
      }
      setConexion(null);
    }
  };

  // Función para reiniciar el cuestionario
  const reiniciarCuestionario = () => {
    // Resetear todos los estados
    setResultados([]);
    setProgreso(0);
    setMostrarResumen(false);
    setConexion(null);
    setTemporizador(0);
    setTiempoInicio(null);
    // Recargar los experimentos
    cargarExperimentos();
  };

  const continuarQuiz = (idNivel) => {
    if (idNivel) {
      // Llamar a marcarCompletada antes de navegar
      if (typeof marcarCompletada === 'function') {
        marcarCompletada();
      }
      navegar(`/nivel/${idNivel}`);
    } else {
      console.error("idNivel no está definido.");
    }
  };

  return (
    <div className="experimento-evento-container">
      <BarraProgreso progreso={progreso} />
      {/* Temporizador */}
      <div className="temporizador">
        {formatearTiempo(temporizador)}
      </div>
      <div className="conceptos-voladores" ref={contenedorRef}>
        {experimentos.map((concepto, indice) => (
          <div
            key={indice}
            className={`recuadro-experimento ${conexion && conexion.indice === indice ? 'connected' : ''}`}
            ref={el => conceptosRefs.current[indice] = el} // Asignar ref
            style={{
              top: posicionesRef.current[indice] ? `${posicionesRef.current[indice].top}%` : '0%',
              left: posicionesRef.current[indice] ? `${posicionesRef.current[indice].left}%` : '0%',
              position: 'absolute',
              zIndex: conexion && conexion.indice === indice ? 2 : 1, // Mostrar por encima si está conectado
            }}
            onClick={() => manejarClickConcepto(indice)} // Agregar manejador de clic
          >
            {concepto}
          </div>
        ))}
      </div>
      {/* Contenedor para el evento y el botón "Comprobar" */}
      {indiceEventoActual !== null && (
        <div className="evento-y-boton">
          <div className="recuadro-evento" onClick={manejarClickEvento} ref={eventoRef}>
            <div className='evento'>
              {eventos[indiceEventoActual]}
            </div>
          </div>
          <button className="boton-comprobar" onClick={manejarComprobar}>
            Comprobar
          </button>
        </div>
      )}
      {/* SVG para dibujar la cuerda */}
      <svg className="connections-svg">
        {conexion && (
          <line
            x1={conexion.from.x}
            y1={conexion.from.y}
            x2={conexion.to.x}
            y2={conexion.to.y}
            stroke="#31708f"
            strokeWidth="2"
            strokeLinecap="round"
          />
        )}
      </svg>
      {/* Modal para respuesta incorrecta */}
      {modalError && (
        <div className="modal-overlay">
          <div className="modal">
            <p>¡Ups! Ese experimento no corresponde a ese evento.</p>
            <button className="boton-seguir-intentando" onClick={manejarCerrarModal}>
              Seguir intentando
            </button>
          </div>
        </div>
      )}
      {/* Mostrar Resumen al finalizar */}
      {mostrarResumen && (
        <Resumen
          resultados={resultados}
          tiempoTotal={temporizador} // Tiempo total en segundos
          totalPreguntas={1} // Tratando la etapa como una única "pregunta"
          reiniciarQuiz={reiniciarCuestionario}
          continuarQuiz={continuarQuiz}
          id_etapa={id_etapa}
        />
      )}
    </div>
  );
};

export default ExperimentoEvento;

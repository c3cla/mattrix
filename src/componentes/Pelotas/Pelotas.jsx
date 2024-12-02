import React, { useState, useEffect } from "react";
import { BlockMath } from "react-katex";
import { useNavigate } from 'react-router-dom';
import "katex/dist/katex.min.css";
import "./Pelotas.css";

import { BarraProgreso, ManejoRespuesta, Resumen } from "../indice";

export const Pelotas = ({ etapa, marcarCompletada }) => {
  const id_etapa = etapa.id_etapa;
  const id_nivel = etapa.id_nivel;

  const [colorPelota, setColorPelota] = useState("");
  const [cantidadPelotasColor, setCantidadPelotasColor] = useState(0);
  const [totalPelotas, setTotalPelotas] = useState(0);
  const [coloresPelotas, setColoresPelotas] = useState([]);
  const [opciones, setOpciones] = useState([]);
  const [respuestaCorrecta, setRespuestaCorrecta] = useState("");
  const [modoDaltonico, setModoDaltonico] = useState(false);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState("");
  const [progreso, setProgreso] = useState(0);
  const [preguntaActual, setPreguntaActual] = useState(1);
  const totalPreguntas = 5;

  const navegar = useNavigate();

  // Para el resumen y resultados
  const [resultados, setResultados] = useState([]);
  const [tiempoInicio, setTiempoInicio] = useState(0);
  const [tiempoTotal, setTiempoTotal] = useState(0);
  const [mostrarResumen, setMostrarResumen] = useState(false);

  const coloresDisponibles = [
    "red",
    "blue",
    "green",
    "yellow",
    "purple",
    "orange",
  ];

  useEffect(() => {
    generarProblema();
  }, []);

  const generarProblema = () => {
    const colorElegido =
      coloresDisponibles[
        Math.floor(Math.random() * coloresDisponibles.length)
      ];
    setColorPelota(colorElegido);

    // Generar número total de pelotas (entre 3 y 20)
    const total = Math.floor(Math.random() * 18) + 3;
    setTotalPelotas(total);

    // Generar cantidad de pelotas del color seleccionado (entre 1 y totalPelotas)
    const cantidadColor = Math.floor(Math.random() * total) + 1;
    setCantidadPelotasColor(cantidadColor);

    // Crear pelotas del color objetivo
    const pelotasColorObjetivo = Array(cantidadColor).fill(colorElegido);

    // Crear pelotas de colores aleatorios para completar el total
    const pelotasAleatorias = Array.from(
      { length: total - cantidadColor },
      () => {
        let colorAleatorio;
        do {
          colorAleatorio =
            coloresDisponibles[
              Math.floor(Math.random() * coloresDisponibles.length)
            ];
        } while (colorAleatorio === colorElegido); // Evitar el color objetivo
        return colorAleatorio;
      }
    );

    // Combinar ambos arreglos y barajar
    const pelotas = [...pelotasColorObjetivo, ...pelotasAleatorias].sort(
      () => Math.random() - 0.5
    );
    setColoresPelotas(pelotas);

    // Calcular respuestas
    const respuestaCorrecta = `${cantidadColor}/${total}`; // Respuesta correcta
    let respuestaIncorrecta = `${total - cantidadColor}/${total}`; // Respuesta incorrecta - probabilidad complemento
    const respuestaSoloNumerador = `${cantidadColor}`; // Tercera opción solo con el numerador

    const opcionesRespuesta = [
      respuestaCorrecta,
      respuestaIncorrecta,
      respuestaSoloNumerador,
    ];

    function generarRespuestaAleatoria() {
      let respuesta;
      do {
        const numeradorAleatorio = Math.floor(Math.random() * total) + 1;
        respuesta = `${numeradorAleatorio}/${total}`;
      } while (opcionesRespuesta.includes(respuesta) || respuesta === respuestaCorrecta);
      return respuesta;
    }

    const respuestaAleatoria = generarRespuestaAleatoria();
    opcionesRespuesta.push(respuestaAleatoria);

    if (respuestaIncorrecta === respuestaCorrecta) {
      respuestaIncorrecta = generarRespuestaAleatoria();
      opcionesRespuesta[1] = respuestaIncorrecta; 
    }


    const opcionesBarajadas = opcionesRespuesta.sort(
      () => Math.random() - 0.5
    ); // Barajar opciones

    setOpciones(opcionesBarajadas);
    setRespuestaCorrecta(respuestaCorrecta);
    setRespuestaSeleccionada("");
    setTiempoInicio(Date.now());
  };

  const manejarSeleccion = (opcion) => {
    setRespuestaSeleccionada(opcion);
  };

  const manejarContinuar = (esCorrecta) => {
    // Calcular tiempo de respuesta
    const tiempoRespuesta = (Date.now() - tiempoInicio) / 1000; // En segundos

    // Actualizar resultados
    setResultados([
      ...resultados,
      { correcta: esCorrecta, tiempo: tiempoRespuesta },
    ]);
    setTiempoTotal(tiempoTotal + tiempoRespuesta);

    if (preguntaActual >= totalPreguntas) {
      // Finalizar etapa
      setProgreso(100);
      setMostrarResumen(true);
    } else {
      // Pasar a la siguiente pregunta
      const nuevaPreguntaActual = preguntaActual + 1;
      setPreguntaActual(nuevaPreguntaActual);

      // Actualizar progreso con el nuevo valor de preguntaActual
      setProgreso(((nuevaPreguntaActual - 1) / totalPreguntas) * 100);

      generarProblema();
    }
  };

  const reiniciarQuiz = () => {
    setResultados([]);
    setTiempoTotal(0);
    setProgreso(0);
    setPreguntaActual(1);
    setMostrarResumen(false);
    generarProblema();
  };

  const continuarQuiz = () => {
    if (id_nivel) {
      if (typeof marcarCompletada === 'function') {
        marcarCompletada();
      }
      navegar(`/nivel/${id_nivel}`);
    } else {
      console.error("id_nivel no está definido.");
    }
  };

  // Mensaje de retroalimentación personalizado
  const mensajeRetroalimentacion = `¡Recuerda! La probabilidad indica cuántas pelotas del color indicado hay, comparado con el total de pelotas. En este caso, se expresa con la siguiente fracción:`;

  // Expresión LaTeX de la fracción general
  const expresionFraccion = `\\dfrac{\\text{Cantidad de pelotas de color ${colorPelota}}}{\\text{Cantidad total de pelotas}}`;

  // Expresión LaTeX de la respuesta correcta
  const respuestaCorrectaLatex = `\\dfrac{${cantidadPelotasColor}}{${totalPelotas}}`;

  // Mapeo de patrones para cada color en modo daltónico
  const patronesDaltonicos = {
    red: "lineas-diagonal",
    blue: "puntos",
    green: "lineascruzadas",
    yellow: "lineas-horizontal",
    purple: "lineas-vertical",
    orange: "rejilla",
  };

  // Función para obtener el ID del patrón según el color
  const obtenerPatternId = (color) => {
    return `pattern-${color}`;
  };

  // Función para obtener el ID del patrón pequeño
  const obtenerPatternIdPequeno = (color) => {
    return `pattern-pequeno-${color}`;
  };

  

  return (
    <div>
      {mostrarResumen ? (
        <Resumen 
          resultados={resultados} 
          tiempoTotal={tiempoTotal} 
          totalPreguntas={3} 
          reiniciarQuiz={reiniciarQuiz} 
          continuarQuiz={continuarQuiz}
          id_etapa={id_etapa}
        />
      ) : (
        <>
          <div className="barra-superior">
            <button
              className="boton-daltonico"
              onClick={() => setModoDaltonico(!modoDaltonico)}
            >
              ¿Tienes daltonismo?
            </button>
            <BarraProgreso progreso={progreso} />
          </div>
  
          <div className="contenedor-principal">
            {/* Contenedor del problema */}
            <div className="contenedor-problema">
              <h3>
                Para ganar una ronda de un juego, se debe elegir una pelota de color{" "}
                {colorPelota}
                {/* Pelota junto al texto */}
                <svg width="48" height="48" style={{ verticalAlign: "middle" }}>
                  <defs>
                    {/* Patrones para la pelota pequeña */}
                    {modoDaltonico &&
                      coloresDisponibles.map((color) => (
                        <pattern
                          key={color}
                          id={obtenerPatternIdPequeno(color)}
                          patternUnits="userSpaceOnUse"
                          width="10"
                          height="10"
                        >
                          {/* Aquí irían las configuraciones de cada patrón */}
                        </pattern>
                      ))}
                  </defs>
                  <circle
                    cx="24"
                    cy="24"
                    r="22"
                    fill={
                      modoDaltonico
                        ? `url(#${obtenerPatternIdPequeno(colorPelota)})`
                        : colorPelota
                    }
                    stroke="black"
                    strokeWidth="2"
                  />
                </svg>
                , de un total de {totalPelotas} pelotas de distintos colores.
                ¿Cuál es la probabilidad de elegir la pelota {colorPelota}?
              </h3>
  
              {/* Imagen de las pelotas */}
              <div className="contenedor-pelotas">
                <svg width="440" height="440">
                  <defs>
                    {/* Patrones para las pelotas grandes */}
                    {modoDaltonico &&
                      coloresDisponibles.map((color) => (
                        <pattern
                          key={color}
                          id={obtenerPatternId(color)}
                          patternUnits="userSpaceOnUse"
                          width="20"
                          height="20"
                        >
                          {/* Aquí irían las configuraciones de cada patrón */}
                        </pattern>
                      ))}
                  </defs>
                  {coloresPelotas.map((color, index) => (
                    <circle
                      key={index}
                      cx={(index % 5) * 80 + 40}
                      cy={Math.floor(index / 5) * 80 + 40}
                      r="30"
                      fill={
                        modoDaltonico
                          ? `url(#${obtenerPatternId(color)})`
                          : color
                      }
                      stroke="black"
                      strokeWidth="2"
                      className="pelota"
                    />
                  ))}
                </svg>
              </div>
  
              {/* Opciones de respuesta */}
              <div className="opciones">
                {opciones.map((opcion, index) => {
                  let latexExpression = "";
                  if (opcion.includes("/")) {
                    const [numerador, denominador] = opcion.split("/");
                    latexExpression = `\\dfrac{${numerador}}{${denominador}}`;
                  } else {
                    latexExpression = opcion;
                  }
                  return (
                    <div
                      key={index}
                      className={`opcion ${
                        respuestaSeleccionada === opcion ? "seleccionada" : ""
                      }`}
                      onClick={() => manejarSeleccion(opcion)}
                    >
                      <BlockMath math={latexExpression} />
                    </div>
                  );
                })}
              </div>
            </div>
  
            {/* Manejo de Respuesta */}
            <ManejoRespuesta
              respuestaUsuario={respuestaSeleccionada}
              respuestaCorrecta={respuestaCorrecta}
              mensajeRetroalimentacion={mensajeRetroalimentacion}
              expresionFraccion={expresionFraccion}
              respuestaCorrectaLatex={respuestaCorrectaLatex}
              onContinuar={manejarContinuar}
              totalPreguntas={totalPreguntas}
              numeroPreguntaActual={preguntaActual}
            />
          </div>
        </>
      )}
    </div>
  );
}
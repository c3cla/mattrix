// ManejoRespuesta.js

import React, { useState, useEffect } from "react";
import "./ManejoRespuesta.css";
import PinguinoFeliz from "../assets/respuestacorrecta.png";
import PinguinoTriste from "../assets/respuestaincorrecta.png";
import confetti from "canvas-confetti";
import { BlockMath } from "react-katex";

export const ManejoRespuesta = ({
  respuestaUsuario,
  respuestaCorrecta,
  mensajeRetroalimentacion,
  expresionFraccion,
  respuestaCorrectaLatex,
  onContinuar,
  totalPreguntas,
  numeroPreguntaActual,
}) => {
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [esCorrecta, setEsCorrecta] = useState(false);
  const [botonTexto, setBotonTexto] = useState("Comprobar");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (mostrarResultado && esCorrecta) {
      lanzarConfetti();
    }
  }, [mostrarResultado, esCorrecta]);

  const lanzarConfetti = () => {
    confetti({
      particleCount: 170,
      spread: 220,
      origin: { y: 0.7 },
    });
  };

  const manejarComprobar = () => {
    if (respuestaUsuario === "") return;

    const esRespuestaCorrecta = respuestaUsuario === respuestaCorrecta;
    setEsCorrecta(esRespuestaCorrecta);
    setMostrarResultado(true);
    setBotonTexto("Continuar");

    if (esRespuestaCorrecta) {
      // Mensaje genérico almacenado en ManejoRespuesta
      const mensajesExito = ["¡Correcto!", "¡Eso es!", "¡Eres increíble!"];
      const mensajeAleatorio =
        mensajesExito[Math.floor(Math.random() * mensajesExito.length)];
      setMensaje(mensajeAleatorio);
    } else {
      // Mostrar el mensaje personalizado de retroalimentación
      setMensaje(mensajeRetroalimentacion);
    }
  };

  const manejarContinuar = () => {
    setMostrarResultado(false);
    setBotonTexto("Comprobar");
    setMensaje("");
    onContinuar(esCorrecta); // Informamos al componente padre si la respuesta fue correcta
  };

  return (
    <div
      className={`barra-inferior ${
        mostrarResultado ? (esCorrecta ? "correcto" : "incorrecto") : ""
      }`}
    >
      <div className="contenido-barra">
        {mostrarResultado && (
          <>
            {esCorrecta ? (
              <>
                {/* Animación de pingüino feliz */}
                <img
                  src={PinguinoFeliz}
                  alt="Pingüino Feliz"
                  className="pinguino-feliz"
                />
                <span className="mensaje">{mensaje}</span>
              </>
            ) : (
              <>
                {/* Pingüino con mensaje de retroalimentación */}
                <div className="pinguino-feedback">
                  <img
                    src={PinguinoTriste}
                    alt="Pingüino Triste"
                    className="pinguino-triste"
                  />
                  <div className="mensaje-burbuja">
                    {mensaje.split('\n').map((linea, index) => (
                      <p key={index}>{linea}</p>
                    ))}
                    {/* Mostrar la fracción general */}
                    {expresionFraccion && (
                      <BlockMath math={expresionFraccion} />
                    )}
                    {/* Mostrar la respuesta correcta */}
                    <p>Por lo tanto, la respuesta correcta es:</p>
                    {respuestaCorrectaLatex && (
                      <BlockMath math={respuestaCorrectaLatex} />
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
        <button
          className="boton-comprobar"
          onClick={mostrarResultado ? manejarContinuar : manejarComprobar}
        >
          {botonTexto}
        </button>
      </div>
    </div>
  );
};

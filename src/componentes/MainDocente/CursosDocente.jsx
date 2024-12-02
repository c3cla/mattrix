import React, { useState, useEffect } from "react";
import { obtenerCursos } from "../../api";
import "./CursosDocente.css";

const CursosDocente = ({ onCursoSeleccionado }) => {
  const [cursos, setCursos] = useState([]);

  useEffect(() => {
    const fetchCursos = async () => {
      const data = await obtenerCursos();
      setCursos(data);
    };

    fetchCursos();
  }, []);

  const manejarSeleccionCurso = (id) => {
    onCursoSeleccionado(id);
  };

  return (
    <div className="cursos-docente">
      <h3>Análisis por estudiante</h3>
      <ul>
        {cursos.map((curso) => (
          <li key={curso.id}>
            <button
              className="button"
              onClick={() => manejarSeleccionCurso(curso.id)}
            >
              {curso.nombre}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CursosDocente;

import React, { useState, useEffect } from "react";
import { obtenerEstudiantesPorCurso } from "../../api";
import "./EstudiantesCurso.css";

const EstudiantesCurso = ({ cursoId, onEstudianteSeleccionado }) => {
  const [estudiantes, setEstudiantes] = useState([]);

  useEffect(() => {
    if (cursoId) {
      const fetchEstudiantes = async () => {
        const data = await obtenerEstudiantesPorCurso(cursoId);
        setEstudiantes(data);
      };
      fetchEstudiantes();
    }
  }, [cursoId]);

  const manejarSeleccionEstudiante = (estudiante) => {
    onEstudianteSeleccionado(estudiante);
  };

  return (
    <div className="estudiantes-curso">
      <h3>Estudiantes del Curso</h3>
      <div className="tarjetas">
        {estudiantes.map((estudiante) => (
          <div
            key={estudiante.id}
            className="tarjeta"
            onClick={() => manejarSeleccionEstudiante(estudiante)}
          >
            <h4>{estudiante.nombre_completo}</h4>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EstudiantesCurso;

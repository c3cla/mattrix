// EstadisticaCurso.jsx
import React, { useEffect, useState } from "react";
import CursosDocente from "./CursosDocente"; // Asegúrate de importar correctamente
import { obtenerAvancesCurso } from "../../api"; // Asegúrate de importar la función de API correcta
import "./EstadisticaCurso.css";

const EstadisticaCurso = () => {
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [estadisticasEstudiantes, setEstadisticasEstudiantes] = useState([]);

  const handleCursoSeleccionado = async (cursoId) => {
    setCursoSeleccionado(cursoId);
    // Al seleccionar un curso, obtenemos todas las estadísticas de los estudiantes
    try {
      const data = await obtenerAvancesCurso(cursoId);
      setEstadisticasEstudiantes(data);
    } catch (error) {
      console.error("Error al obtener las estadísticas de los estudiantes:", error);
    }
  };

  return (
    <div className="estadistica-curso">
      <h2>Estadísticas del Curso</h2>

      {/* Selector de cursos */}
      <CursosDocente onCursoSeleccionado={handleCursoSeleccionado} />

      {/* Tabla de estadísticas de estudiantes */}
      <div className="contenido-principal">
        {cursoSeleccionado ? (
          estadisticasEstudiantes.length > 0 ? (
            <table className="tabla-estadisticas">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Logro (%)</th>
                  <th>Tiempo</th>
                  <th>Etapa</th>
                  <th>Habilidad</th>
                  <th>Dificultad</th>
                  <th>OA</th>
                </tr>
              </thead>
              <tbody>
                {estadisticasEstudiantes.map((estadistica, index) => (
                  <tr key={index}>
                    <td>{estadistica.estudiante_nombre}</td>
                    <td>{estadistica.logro}</td>
                    <td>{estadistica.tiempo}</td>
                    <td>{estadistica.etapa.nombre}</td>
                    <td>{estadistica.etapa.habilidad}</td>
                    <td>{estadistica.etapa.dificultad}</td>
                    <td>{estadistica.etapa.nivel.OA.OA}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No se encontraron estadísticas para este curso.</p>
          )
        ) : (
          <p>Selecciona un curso para ver sus estadísticas</p>
        )}
      </div>
    </div>
  );
};

export default EstadisticaCurso;

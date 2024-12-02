import React, { useState } from "react";
import {SaludoUsuario, CursosDocente, EstadisticaEstudiante, EstadisticaCurso, EstudiantesCurso, SolicitudesDocente} from "../indice"
import "./MainDocente.css";


const MainDocente = () => {
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);

  const handleCursoSeleccionado = (cursoId) => {
    setCursoSeleccionado(cursoId);
    setEstudianteSeleccionado(null); 
  };

  const handleEstudianteSeleccionado = (estudiante) => {
    setEstudianteSeleccionado(estudiante);
  };

  return (
    <div className="main-docente">
      <div className="barra-lateral">
        <SaludoUsuario />
        <div className="contenedor-solicitudes">
          <SolicitudesDocente />
        </div>
        
        <CursosDocente onCursoSeleccionado={handleCursoSeleccionado} />
        {cursoSeleccionado && (
          <EstudiantesCurso
            cursoId={cursoSeleccionado}
            onEstudianteSeleccionado={handleEstudianteSeleccionado}
          />
        )}
      </div>
      <div className="contenido-principal">
        {estudianteSeleccionado ? (
          <EstadisticaEstudiante estudiante={estudianteSeleccionado} />
        ) : cursoSeleccionado ? (
          <EstadisticaCurso cursoId={cursoSeleccionado} />
        ) : (
          <p>Selecciona un curso para ver sus estadísticas</p>
        )}
      </div>
    </div>
  );
};

export default MainDocente;

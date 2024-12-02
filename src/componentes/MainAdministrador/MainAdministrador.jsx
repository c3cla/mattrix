import React, { useState } from "react";
import { SaludoUsuario } from "../indice";
import AdminColegioCurso from "./AdminColegioCurso";
import AdminUsuarios from "./AdminUsuarios";
import "./MainAdministrador.css";

const Administrador = () => {
  const [isAdminColegioCursoVisible, setAdminColegioCursoVisible] =
    useState(false);
  const [isAdminUsuariosVisible, setAdminUsuariosVisible] = useState(false);

  const toggleAdminColegioCurso = () => {
    setAdminColegioCursoVisible(!isAdminColegioCursoVisible);
  };

  const toggleAdminUsuarios = () => {
    setAdminUsuariosVisible(!isAdminUsuariosVisible);
  };

  return (
    <div className="main-administrador">
      <div className="barra-lateral">
        <SaludoUsuario />
        <button className="boton-admin" onClick={toggleAdminColegioCurso}>
          {isAdminColegioCursoVisible
            ? "Ocultar Panel Colegios"
            : "Panel Colegios"}
        </button>
        <button className="boton-admin" onClick={toggleAdminUsuarios}>
          {isAdminUsuariosVisible ? "Ocultar Panel Usuarios" : "Panel Usuarios"}
        </button>
        <button className="boton-admin">Panel Niveles</button>
        <button className="boton-admin">Vista Profesor</button>
        <button className="boton-admin">Vista Estudiante</button>
      </div>
      <div className="contenido-principal">
        {isAdminColegioCursoVisible && <AdminColegioCurso />}
        {isAdminUsuariosVisible && <AdminUsuarios />}
      </div>
    </div>
  );
};

export default Administrador;

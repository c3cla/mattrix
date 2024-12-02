import React from "react";
import {
  MostrarNiveles,
  SeleccionarDocente,
  SaludoUsuario,
  DocenteAsignado,
} from "../indice";

const MainEstudiante = () => {
  return (
    <div className="main-docente">
      <div className="barra-lateral">
        <SaludoUsuario />
        <DocenteAsignado />
        <SeleccionarDocente />
      </div>
      <div className="contenido-principal">
        <MostrarNiveles />
      </div>
    </div>
  );
};

export default MainEstudiante;

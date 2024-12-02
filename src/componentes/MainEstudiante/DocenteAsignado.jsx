import React, { useState, useEffect } from "react";
import { obtenerDocenteAsignado } from "../../api";

const DocenteAsignado = () => {
  const [docenteNombre, setDocenteNombre] = useState(null);

  useEffect(() => {
    const fetchDocenteAsignado = async () => {
      const data = await obtenerDocenteAsignado();
      setDocenteNombre(data?.docente_nombre);
    };

    fetchDocenteAsignado();
  }, []);

  return (
    <div>
      {docenteNombre ? (
        <p>Tu docente asignado es {docenteNombre}.</p>
      ) : (
        <p>No tienes un docente asignado.</p>
      )}
    </div>
  );
};

export default DocenteAsignado;

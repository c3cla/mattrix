import React, { useState, useEffect } from "react";
import { obtenerSolicitudesPendientes, confirmarCurso } from "../../api";
import "./Solicitudes.css"

const SolicitudesDocente = () => {
  const [solicitudes, setSolicitudes] = useState([]);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      const data = await obtenerSolicitudesPendientes();
      setSolicitudes(data);
    };

    fetchSolicitudes();
  }, []);

  const manejarConfirmacion = async (id, confirmado) => {
    if (confirmado) {
      await confirmarCurso(id);
      alert("Estudiante confirmado");
    } else {
      await confirmarCurso(id, false); // se envía false para eliminar la solicitud
      alert("Solicitud rechazada");
    }
    setSolicitudes(solicitudes.filter((solicitud) => solicitud.id !== id));
  };

  return (
    <div>
      <h3>Solicitudes de estudiantes</h3>
      {solicitudes.map((solicitud) => (
        <div key={solicitud.id}>
          <p>
            ¡{solicitud.estudiante_nombre_completo} (RUT: {solicitud.estudiante_rut}) quiere unirse a tu clase!
          </p>
          <button className="botonSolicitud" onClick={() => manejarConfirmacion(solicitud.id, true)}>Aceptar</button>
          <button className="botonSolicitud" onClick={() => manejarConfirmacion(solicitud.id, false)}>Rechazar</button>
        </div>
      ))}
    </div>
  );
};

export default SolicitudesDocente;

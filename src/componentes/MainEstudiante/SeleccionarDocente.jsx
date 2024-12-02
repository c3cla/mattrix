import React, { useState, useEffect } from "react";
import { obtenerDocentes, solicitarCurso } from "../../api";
import "./SeleccionarDocente.css"; 

const SeleccionarDocente = ({ nombreUsuario }) => {
  const [docentes, setDocentes] = useState([]);
  const [docenteSeleccionado, setDocenteSeleccionado] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchDocentes = async () => {
      const listaDocentes = await obtenerDocentes();
      setDocentes(listaDocentes);
    };
    fetchDocentes();
  }, []);

  const manejarSeleccion = async () => {
    if (docenteSeleccionado) {
      await solicitarCurso({ docente_id: docenteSeleccionado });
      alert("Solicitud enviada al docente.");
      setModalVisible(false); // Cierra el modal después de enviar la solicitud
    }
  };

  return (
    <div>
      {/* Botón que abre el modal */}
      <button className="boton-seleccionar-docente" onClick={() => setModalVisible(true)}>
        Seleccionar Docente
      </button>

      {/* Modal para seleccionar el docente */}
      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Selecciona un docente para unirte a su clase</h3>
            <select
              className="modal-select"
              value={docenteSeleccionado}
              onChange={(e) => setDocenteSeleccionado(e.target.value)}
            >
              <option value="">Selecciona un docente</option>
              {docentes.map((docente) => (
                <option key={docente.id} value={docente.id}>
                  {docente.nombre_completo}
                </option>
              ))}
            </select>
            <div className="modal-buttons">
              <button className="boton-modal" onClick={manejarSeleccion}>Enviar solicitud</button>
              <button className="boton-modal cancelar" onClick={() => setModalVisible(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeleccionarDocente;

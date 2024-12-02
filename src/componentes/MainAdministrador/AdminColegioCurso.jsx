import React, { useState, useEffect } from "react";
import api from "../../api";
import "./AdminColegioCurso.css";

const AdminColegioCurso = () => {
  const [colegios, setColegios] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [currentColegio, setCurrentColegio] = useState({
    id: null,
    nombre: "",
    direccion: "",
    ciudad: "",
  });
  const [currentCurso, setCurrentCurso] = useState({
    id: null,
    nivel: "",
    letra: "",
    tipo: "Básico", // Valor por defecto para el tipo
  });
  const [isEditColegioModalOpen, setIsEditColegioModalOpen] = useState(false);
  const [isAddColegioModalOpen, setIsAddColegioModalOpen] = useState(false);
  const [isEditCursoModalOpen, setIsEditCursoModalOpen] = useState(false);
  const [isAddCursoModalOpen, setIsAddCursoModalOpen] = useState(false);
  const [showCourses, setShowCourses] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  useEffect(() => {
    fetchColegios();
  }, []);

  const fetchColegios = async () => {
    try {
      const response = await api.get("/api/administrador/colegios/");
      setColegios(response.data);
    } catch (error) {
      console.error("Error al obtener los colegios:", error);
    }
  };

  const fetchCursos = async (colegioId) => {
    if (!colegioId) return;

    try {
      const response = await api.get(
        `/api/administrador/colegios/${colegioId}/cursos/`
      );
      const cursosConNombre = response.data.map((curso) => ({
        ...curso,
        nombre: `${curso.nivel} ${curso.letra}`, // Crear el nombre en el frontend para visualización
      }));
      setCursos(cursosConNombre);
      setShowCourses(colegioId);
    } catch (error) {
      console.error(
        "Error al obtener los cursos:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleEditColegio = (colegio) => {
    setCurrentColegio(colegio); // Carga el colegio seleccionado en el estado
    setIsEditColegioModalOpen(true); // Abre el modal de edición
  };

  const handleUpdateColegio = async () => {
    try {
      const response = await api.put(
        `/api/administrador/colegios/${currentColegio.id}/`,
        currentColegio // Envía el colegio actualizado al backend
      );
      // Actualiza la lista de colegios con la respuesta del backend
      setColegios(
        colegios.map((colegio) =>
          colegio.id === currentColegio.id ? response.data : colegio
        )
      );
      setMessage("Colegio actualizado exitosamente");
      setMessageType("success");
      handleCloseModal(); // Cierra el modal después de la actualización
    } catch (error) {
      setMessage("Error al actualizar el colegio");
      setMessageType("error");
      console.error("Error al actualizar el colegio:", error);
    }
  };

  const handleDeleteColegio = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este colegio?")) {
      try {
        await api.delete(`/api/administrador/colegios/${id}/`);
        // Filtra el colegio eliminado de la lista en el frontend
        setColegios(colegios.filter((colegio) => colegio.id !== id));
        setMessage("Colegio eliminado exitosamente");
        setMessageType("success");
      } catch (error) {
        setMessage("Error al eliminar el colegio");
        setMessageType("error");
        console.error("Error al eliminar el colegio:", error);
      }
    }
  };

  const handleInputChangeColegio = (e) => {
    const { name, value } = e.target;
    setCurrentColegio((prev) => ({
      ...prev,
      [name]: value || "",
    }));
  };

  const handleCreateColegio = async () => {
    try {
      const response = await api.post("/api/administrador/colegios/", currentColegio);
      // Agrega el nuevo colegio a la lista de colegios
      setColegios([...colegios, response.data]);
      setMessage("Colegio creado exitosamente");
      setMessageType("success");
      handleCloseModal(); // Cierra el modal después de agregar el colegio
    } catch (error) {
      setMessage("Error al crear el colegio");
      setMessageType("error");
      console.error("Error al crear el colegio:", error);
    }
  };
  
  const handleShowCourses = (colegioId) => {
    showCourses === colegioId ? setShowCourses(null) : fetchCursos(colegioId);
  };

  const handleCreateCurso = async () => {
    const { nivel, tipo, letra } = currentCurso;
    const formattedNivel = `${nivel}° ${tipo}`; // Concatenar nivel con tipo en el frontend

    try {
      const response = await api.post("/api/administrador/cursos/", {
        nivel: formattedNivel, // Enviar nivel completo
        letra: letra.toUpperCase(), // Enviar letra en mayúsculas
      });
      setCursos([...cursos, { ...response.data }]);
      setIsAddCursoModalOpen(false);
    } catch (error) {
      console.error(
        "Error al crear el curso:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleEditCurso = (curso) => {
    if (curso && curso.nombre) {
      // Aquí, se asume que el nombre está en el formato "nivel tipo letra"
      const [nivel, tipo, letra] = curso.nombre.split(" ");

      setCurrentCurso({
        id: curso.id,
        nivel: nivel.replace("°", ""), // Remueve el símbolo "°"
        tipo: tipo || "Básico", // Usa el tipo que se detecta o "Básico" como predeterminado
        letra: letra || "", // Letra del curso
      });
      setIsEditCursoModalOpen(true);
    }
  };

  const handleUpdateCurso = async () => {
    const { nivel, tipo, letra } = currentCurso;
    const formattedNivel = `${nivel}° ${tipo}`; // Formatear nivel con el tipo (ej. "3° Básico")

    try {
      const response = await api.put(
        `/api/administrador/cursos/${currentCurso.id}/`,
        { nivel: formattedNivel, letra } // Enviar datos al backend correctamente
      );

      // Crear el objeto actualizado con el nombre formateado para el frontend
      const cursoActualizado = {
        ...response.data,
        nombre: `${formattedNivel} ${letra.toUpperCase()}`, // Formatear el nombre para mostrarlo correctamente
      };

      // Actualizar el estado de 'cursos' con el curso editado
      setCursos(
        cursos.map((curso) =>
          curso.id === currentCurso.id ? cursoActualizado : curso
        )
      );
      setIsEditCursoModalOpen(false);
    } catch (error) {
      console.error(
        "Error al actualizar el curso:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleDeleteCurso = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este curso?")) {
      try {
        await api.delete(`/api/administrador/cursos/${id}/`);
        setCursos(cursos.filter((curso) => curso.id !== id));
        setMessage("Curso eliminado exitosamente");
        setMessageType("success");
      } catch (error) {
        setMessage("Error al eliminar el curso");
        setMessageType("error");
      }
    }
  };

  const handleCloseModal = () => {
    setCurrentColegio({ id: null, nombre: "", direccion: "", ciudad: "" });
    setCurrentCurso({ id: null, nivel: "", letra: "", tipo: "Básico" });
    setIsEditColegioModalOpen(false);
    setIsAddColegioModalOpen(false);
    setIsEditCursoModalOpen(false);
    setIsAddCursoModalOpen(false);
  };

  return (
    <div className="admin-panel">
      <h1 className="admin-title">Panel de Colegios</h1>
      {message && <p className={`admin-message ${messageType}`}>{message}</p>}
      <button
        onClick={() => setIsAddColegioModalOpen(true)}
        className="admin-button primary-button"
      >
        Agregar Colegio
      </button>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Colegio</th>
            <th>Dirección</th>
            <th>Ciudad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {colegios.map((colegio) => (
            <React.Fragment key={colegio.id}>
              <tr>
                <td>{colegio.nombre}</td>
                <td>{colegio.direccion}</td>
                <td>{colegio.ciudad}</td>
                <td>
                  <button
                    onClick={() => handleShowCourses(colegio.id)}
                    className="admin-button view-button"
                  >
                    {showCourses === colegio.id
                      ? "Ocultar Cursos"
                      : "Ver Cursos"}
                  </button>
                  <button
                    onClick={() => handleEditColegio(colegio)}
                    className="admin-button edit-button"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteColegio(colegio.id)}
                    className="admin-button danger-button"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
              {showCourses === colegio.id && (
                <tr className="course-row">
                  <td colSpan="4">
                    <div className="course-list">
                      <h3>Cursos del Colegio {colegio.nombre}</h3>
                      <button
                        onClick={() => setIsAddCursoModalOpen(true)}
                        className="admin-button primary-button"
                      >
                        Agregar Curso
                      </button>
                      <ul>
                        {Array.isArray(cursos) && cursos.length > 0 ? (
                          cursos.map((curso) => (
                            <li key={curso.id} className="admin-list-item">
                              <span>{curso.nombre}</span>
                              <div>
                                <button
                                  onClick={() => handleEditCurso(curso)}
                                  className="admin-button edit-button"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDeleteCurso(curso.id)}
                                  className="admin-button danger-button"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </li>
                          ))
                        ) : (
                          <p>No hay cursos disponibles.</p>
                        )}
                      </ul>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      {(isEditColegioModalOpen || isAddColegioModalOpen) && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>
              {isEditColegioModalOpen ? "Editar Colegio" : "Agregar Colegio"}
            </h2>
            <input
              type="text"
              name="nombre"
              placeholder="Nombre del Colegio"
              value={currentColegio.nombre || ""}
              onChange={handleInputChangeColegio}
            />
            <input
              type="text"
              name="direccion"
              placeholder="Dirección"
              value={currentColegio.direccion || ""}
              onChange={handleInputChangeColegio}
            />
            <input
              type="text"
              name="ciudad"
              placeholder="Ciudad"
              value={currentColegio.ciudad || ""}
              onChange={handleInputChangeColegio}
            />
            <button
              onClick={
                isEditColegioModalOpen
                  ? handleUpdateColegio
                  : handleCreateColegio
              }
              className="admin-button primary-button"
            >
              {isEditColegioModalOpen ? "Guardar Cambios" : "Agregar"}
            </button>
            <button
              onClick={handleCloseModal}
              className="admin-button danger-button"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      {(isEditCursoModalOpen || isAddCursoModalOpen) && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{isEditCursoModalOpen ? "Editar Curso" : "Agregar Curso"}</h2>

            <div>
              <label>Nivel del Curso</label>
              <input
                type="text"
                name="nivel"
                placeholder="Nivel del Curso"
                value={currentCurso.nivel || ""}
                onChange={(e) =>
                  setCurrentCurso({ ...currentCurso, nivel: e.target.value })
                }
              />
            </div>
            <div>
              <label>Tipo del Curso</label>
              <select
                value={currentCurso.tipo || "Básico"}
                onChange={(e) =>
                  setCurrentCurso({ ...currentCurso, tipo: e.target.value })
                }
              >
                <option value="Básico">Básico</option>
                <option value="Medio">Medio</option>
              </select>
            </div>
            <div>
              <label>Letra del Curso</label>
              <input
                type="text"
                name="letra"
                placeholder="Letra del Curso"
                value={currentCurso.letra || ""}
                onChange={(e) =>
                  setCurrentCurso({
                    ...currentCurso,
                    letra: e.target.value.toUpperCase(),
                  })
                }
              />
            </div>

            <button
              onClick={
                isEditCursoModalOpen ? handleUpdateCurso : handleCreateCurso
              }
              className="admin-button primary-button"
            >
              {isEditCursoModalOpen ? "Guardar Cambios" : "Agregar"}
            </button>

            <button
              onClick={handleCloseModal}
              className="admin-button danger-button"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminColegioCurso;

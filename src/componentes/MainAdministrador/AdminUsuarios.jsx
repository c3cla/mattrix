import React, { useState, useEffect } from "react";
import api from "../../api";
import "./AdminUsuarios.css";

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [currentUser, setCurrentUser] = useState({
    id: null,
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    rut: "",
    role: "student", // Valor predeterminado
    colegio: "",
    curso: "",
    password: "", // Agregar para manejo en caso de usuario nuevo
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [colegios, setColegios] = useState([]);
  const [cursos, setCursos] = useState([]);

  useEffect(() => {
    fetchUsuarios();
    fetchColegios();
    fetchCursos();
  }, []);

  const fetchColegios = async () => {
    try {
      const response = await api.get("/api/administrador/colegios/");
      setColegios(response.data);
    } catch (error) {
      console.error("Error al obtener los colegios:", error);
    }
  };

  const fetchCursos = async () => {
    try {
      const response = await api.get("/api/administrador/cursos/");
      setCursos(response.data);
    } catch (error) {
      console.error("Error al obtener los cursos:", error);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const response = await api.get("/api/administrador/usuarios/");
      setUsuarios(response.data?.data || []);
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
      setUsuarios([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser((prevUser) => ({
      ...prevUser,
      [name]: value || "", // Asegura que no sea null
    }));
  };

  const handleSaveChanges = async () => {
    try {
      await api.put(
        `/api/administrador/usuarios/${currentUser.id}/update/`,
        currentUser
      );
      setMessage("Usuario actualizado exitosamente");
      setMessageType("success");
      setIsEditModalOpen(false);
      fetchUsuarios(); // Recargar la lista de usuarios
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      setMessage("Error al actualizar el usuario");
      setMessageType("error");
    }
  };

  const handleAddUser = async () => {
    try {
      const response = await api.post("/api/administrador/usuarios/create/", {
        ...currentUser,
        password: currentUser.password || "default_password", // Temporal o requerido por el backend
      });
      setUsuarios([...usuarios, response.data]);
      setCurrentUser({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        rut: "",
        role: "student",
        colegio: "",
        curso: "",
        password: "",
      });
      setIsAddModalOpen(false);
      setMessage("Usuario agregado exitosamente.");
      setMessageType("success");
    } catch (error) {
      console.error("Error al agregar el usuario:", error);
      setMessage("Error al agregar el usuario.");
      setMessageType("error");
    }
  };

  const handleEditUser = (usuario) => {
    // Asegura que cada campo tenga un valor por defecto (cadena vacía)
    setCurrentUser({
      id: usuario.id,
      username: usuario.username || "",
      first_name: usuario.first_name || "",
      last_name: usuario.last_name || "",
      email: usuario.email || "",
      rut: usuario.rut || "",
      role: usuario.role || "student",
      colegio: usuario.colegio?.id || "", // Suponiendo que el campo colegio contiene un objeto con id
      curso: usuario.curso?.id || "",
      password: "", // Opcionalmente puedes no mostrar la contraseña aquí
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        await api.delete(`/api/administrador/usuarios/${userId}/delete/`);
        setUsuarios(usuarios.filter((user) => user.id !== userId));
        setMessage("Usuario eliminado correctamente");
        setMessageType("success");
      } catch (error) {
        console.error("Error al eliminar el usuario:", error);
        setMessage("Error al eliminar el usuario");
        setMessageType("error");
      }
    }
  };

  const handleCloseModal = () => {
    setCurrentUser({
      id: null,
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      rut: "",
      role: "student",
      colegio: "",
      curso: "",
      password: "",
    });
    setIsEditModalOpen(false);
    setIsAddModalOpen(false);
  };

  return (
    <div className="admin-usuarios">
      <h1 className="admin-title">Panel de Usuarios</h1>
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="admin-button primary-button"
      >
        Agregar Usuario
      </button>
      {message && <p className={`admin-message ${messageType}`}>{message}</p>}

      <input
        type="text"
        placeholder="Buscar"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />
      <table className="admin-table">
        <thead>
          <tr>
            <th>RUT</th>
            <th>Apellido</th>
            <th>Nombre</th>
            <th>Colegio</th>
            <th>Curso</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td>{usuario.rut || "N/A"}</td>
              <td>{usuario.last_name || "N/A"}</td>
              <td>{usuario.first_name || "N/A"}</td>
              <td>{usuario.colegio?.nombre || "Sin colegio"}</td>
              <td>{usuario.curso?.nombre || "Sin curso"}</td>
              <td>{usuario.role || "Sin rol"}</td>
              <td>
                <button
                  onClick={() => handleEditUser(usuario)}
                  className="admin-button edit-button"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteUser(usuario.id)}
                  className="admin-button danger-button"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal para agregar o editar usuario */}
      {(isEditModalOpen || isAddModalOpen) && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{isEditModalOpen ? "Editar Usuario" : "Agregar Usuario"}</h2>
            <input
              type="text"
              name="username"
              placeholder="Nombre de usuario"
              value={currentUser.username || ""}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="first_name"
              placeholder="Nombre"
              value={currentUser.first_name || ""}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="last_name"
              placeholder="Apellido"
              value={currentUser.last_name || ""}
              onChange={handleInputChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={currentUser.email || ""}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="rut"
              placeholder="RUT"
              value={currentUser.rut || ""}
              onChange={handleInputChange}
            />
            <select
              name="colegio"
              value={currentUser.colegio || ""}
              onChange={handleInputChange}
              className="admin-dropdown"
            >
              <option value="">Selecciona un colegio</option>
              {colegios.map((colegio) => (
                <option key={colegio.id} value={colegio.id}>
                  {colegio.nombre}
                </option>
              ))}
            </select>

            <select
              name="curso"
              value={currentUser.curso || ""}
              onChange={handleInputChange}
              className="admin-dropdown"
            >
              <option value="">Selecciona un curso</option>
              {cursos.map((curso) => (
                <option key={curso.id} value={curso.id}>
                  {curso.nombre}
                </option>
              ))}
            </select>
            <select
              name="role"
              value={currentUser.role || ""}
              onChange={handleInputChange}
              className="admin-dropdown"
            >
              <option value="student">Estudiante</option>
              <option value="teacher">Profesor</option>
              <option value="admin">Administrador</option>
            </select>
            {isAddModalOpen && (
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={currentUser.password || ""}
                onChange={handleInputChange}
              />
            )}
            <button
              onClick={isEditModalOpen ? handleSaveChanges : handleAddUser}
              className="admin-button primary-button"
            >
              {isEditModalOpen ? "Guardar Cambios" : "Agregar"}
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

export default AdminUsuarios;

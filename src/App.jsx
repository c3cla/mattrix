// src/App.js
import React, { useEffect, useState } from "react";
import {
  Login,
  Register,
  MainEstudiante,
  MainDocente,
  NotFound,
  ProtectedRoute,
  MapaEtapas,
  DetalleEtapas,
  Administrador,
} from "./componentes/indice";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

function App() {
  // Estados para almacenar el rol y el nombre del usuario
  const [tipoUsuario, setTipoUsuario] = useState(null);
  const [nombreUsuario, setNombreUsuario] = useState("");

  useEffect(() => {
    // Obtener rol y nombre de usuario de localStorage si existen
    const storedRole = localStorage.getItem("role");
    const storedName = localStorage.getItem("nombreUsuario");
    if (storedRole) setTipoUsuario(storedRole);
    if (storedName) setNombreUsuario(storedName);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={["teacher", "admin"]}>
              <MainDocente />
            </ProtectedRoute>
          }
        />
        <Route
          path="/estudiante"
          element={
            <ProtectedRoute allowedRoles={["student","teacher", "admin"]}>
              <MainEstudiante />
            </ProtectedRoute>
          }
        />

        <Route
          path="/nivel/:id_nivel"
          element={
            <ProtectedRoute allowedRoles={["student", "teacher", "admin"]}>
              <MapaEtapas />
            </ProtectedRoute>
          }
        />

        <Route
          path="/etapa/:id_etapa"
          element={
            <ProtectedRoute allowedRoles={["student", "teacher", "admin"]}>
              <DetalleEtapas />
            </ProtectedRoute>
          }
        />

        <Route
          path="/administrador"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Administrador />
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

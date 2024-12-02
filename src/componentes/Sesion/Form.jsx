import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api"; // Asegúrate de que este archivo esté correctamente configurado
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./Constants";
import LoadingIndicator from "./LoadingIndicator";
import "./Form.css";

const EnhancedLoginScreen = ({ route, method }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);
  const navigate = useNavigate();

  const name = method === "login" ? "Iniciar sesión" : "Registro";

  const handleClick = () => {
    if (method === "login") {
      navigate("/register");
    } else {
      navigate("/login");
    }
  };

  useEffect(() => {
    const updateDimensions = () => {
      setScreenWidth(window.innerWidth);
      setScreenHeight(window.innerHeight);
    };
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    const boxes = document.querySelectorAll(".boxColor");
    boxes.forEach((box) => {
      box.addEventListener("mouseover", () => {
        box.style.backgroundColor = "#00f700";
      });
      box.addEventListener("mouseout", () => {
        setTimeout(() => {
          box.style.backgroundColor = "#1f1f1f";
        }, 400);
      });
    });
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    // Validación de campos vacíos
    if (method === "register" && (!username || !password || !confirmPassword || !firstName || !lastName || !email)) {
      alert("Todos los campos son obligatorios");
      setLoading(false);
      return;
    }

    if (method === "login" && (!username || !password)) {
      alert("Todos los campos son obligatorios");
      setLoading(false);
      return;
    }

    // Validación de coincidencia de contraseñas
    if (method === "register" && password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    // Validación de email
    if (method === "register" && !validateEmail(email)) {
      alert("Correo electrónico no válido");
      setLoading(false);
      return;
    }

    try {
      const requestData =
        method === "login"
          ? { username, password }
          : { username, password, email, first_name: firstName, last_name: lastName };
      const res = await api.post(route, requestData);

      if (method === "login") {
        const { access, refresh, user } = res.data;

        if (access && refresh && user) {
          localStorage.setItem(ACCESS_TOKEN, access);
          localStorage.setItem(REFRESH_TOKEN, refresh);

          // Guarda rol y nombre de usuario en localStorage
          localStorage.setItem("role", user.role);
          localStorage.setItem("nombreUsuario", user.username);

          // Redirige según el rol del usuario
          if (user.role === "teacher") {
            navigate("/");
          } else if (user.role === "student") {
            navigate("/estudiante");
          } else if (user.role === "admin") {
            navigate("/administrador");
          } else {
            alert("Rol de usuario no reconocido.");
          }
        } else {
          throw new Error("Estructura de respuesta inesperada");
        }
      } else {
        navigate("/login");
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert("Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.");
      }
      console.error("Error de autenticación:", error);
    } finally {
      setLoading(false);
    }
  };

  const horizontal = () => {
    const horizontal = screenWidth / 50;
    const elements = [];
    for (let index = 0; index < horizontal; index++) {
      elements.push(
        <div
          key={index}
          className="boxColor"
          style={{
            height: "50px",
            width: "50px",
            backgroundColor: "#1f1f1f",
            marginRight: "4px",
            display: "inline-block",
          }}
        ></div>
      );
    }
    return elements;
  };

  const showBoxes = () => {
    const vertical = screenHeight / 50;
    const elements = [];
    for (let index = 0; index < vertical; index++) {
      elements.push(
        <div key={index} className="boxCover">
          {horizontal()}
        </div>
      );
    }
    return elements;
  };

  return (
    <div className="fullScreen">
      {showBoxes()}
      <div className="loginContainer">
        <div className="loginContent">
          <h1 className="welcomeText">{name}</h1>
          <form onSubmit={handleSubmit} className="loginForm">
            {method === "register" && (
              <>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Nombre"
                  className="inputField"
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Apellido"
                  className="inputField"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Correo"
                  className="inputField"
                />
              </>
            )}
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Usuario"
              className="inputField"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="inputField"
            />
            {method === "register" && (
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmar Contraseña"
                className="inputField"
              />
            )}
            <div className="loadingContainer">{loading && <LoadingIndicator />}</div>
            <div className="buttonContainer">
              <button type="submit" className="loginButton">
                {name}
              </button>
              <button
                type="button"
                className="loginButton"
                onClick={handleClick}
              >
                {name === "Iniciar sesión" ? "Registro" : "Iniciar sesión"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EnhancedLoginScreen;

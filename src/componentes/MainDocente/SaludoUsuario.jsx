import React, { useEffect, useState } from 'react';

const SaludoUsuario = () => {
  const [nombreUsuario, setNombreUsuario] = useState('');

  useEffect(() => {
    // Obtener nombreUsuario del localStorage
    const storedNombreUsuario = localStorage.getItem('nombreUsuario');
    if (storedNombreUsuario) {
      setNombreUsuario(storedNombreUsuario);
    } else {
      setNombreUsuario('invitado');
    }
  }, []);

  return <h1>¡Hola {nombreUsuario}!</h1>;
};

export default SaludoUsuario;

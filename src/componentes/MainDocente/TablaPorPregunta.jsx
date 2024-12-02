import React from 'react';

const TablaPorPregunta = ({ avances }) => {
  const rows = avances.map((avance, index) => ({
    id: index,
    etapa: avance.etapa.nombre,
    OA: avance.etapa.nivel.OA.OA,
    nivel: avance.etapa.nivel.nombre,
    habilidad: avance.etapa.habilidad,
    dificultad: avance.etapa.dificultad,
    logro: avance.logro,
    tiempo: avance.tiempo,
  }));

  return (
    <div>
      <h4>Detalle de Actividades</h4>
      {rows.length > 0 ? (
        <table className="tabla-detalle">
          <thead>
            <tr>
              <th>Etapa</th>
              <th>OA</th>
              <th>Nivel</th>
              <th>Habilidad</th>
              <th>Dificultad</th>
              <th>Logro (%)</th>
              <th>Tiempo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.etapa}</td>
                <td>{row.OA}</td>
                <td>{row.nivel}</td>
                <td>{row.habilidad}</td>
                <td>{row.dificultad}</td>
                <td>{row.logro}</td>
                <td>{row.tiempo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay datos para mostrar en la tabla.</p>
      )}
    </div>
  );
};

export default TablaPorPregunta;

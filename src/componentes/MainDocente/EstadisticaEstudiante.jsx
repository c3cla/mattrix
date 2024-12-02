import React, { useState, useEffect } from 'react';
import { obtenerAvancesEstudiante } from '../../api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import './EstadisticaEstudiante.css';

const VerEstadisticas = ({ estudiante }) => {
  const [avances, setAvances] = useState([]);

  useEffect(() => {
    if (estudiante) {
      const fetchAvances = async () => {
        const data = await obtenerAvancesEstudiante(estudiante.id);
        setAvances(data);
      };
      fetchAvances();
    }
  }, [estudiante]);

  // Preparación de datos para los gráficos
  const dataLogroPorOA = [];
  const oaMap = {};

  avances.forEach((avance) => {
    const OA = avance.etapa.nivel.OA.OA;
    if (!oaMap[OA]) {
      oaMap[OA] = { OA, logroTotal: 0, count: 0 };
    }
    oaMap[OA].logroTotal += parseFloat(avance.logro);
    oaMap[OA].count += 1;
  });

  for (const OA in oaMap) {
    dataLogroPorOA.push({
      OA,
      promedioLogro: parseFloat((oaMap[OA].logroTotal / oaMap[OA].count).toFixed(2)),
    });
  }

  const dificultades = ['baja', 'media', 'alta'];
  const dataLogroPorDificultad = dificultades.map((dificultad) => {
    const filteredAvances = avances.filter(
      (avance) => avance.etapa.dificultad.toLowerCase() === dificultad
    );
    const totalLogro = filteredAvances.reduce((sum, avance) => sum + parseFloat(avance.logro), 0);
    return {
      dificultad: dificultad.charAt(0).toUpperCase() + dificultad.slice(1),
      promedioLogro: filteredAvances.length > 0 ? (totalLogro / filteredAvances.length).toFixed(2) : 0,
    };
  });

  const habilidadMap = {};
  avances.forEach((avance) => {
    const habilidad = avance.etapa.habilidad;
    if (!habilidadMap[habilidad]) habilidadMap[habilidad] = 0;
    habilidadMap[habilidad] += 1;
  });

  const dataHabilidades = Object.keys(habilidadMap).map((habilidad) => ({
    name: habilidad,
    value: habilidadMap[habilidad],
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
    <div className="dashboard-docente">
      <h2>Estadísticas de {estudiante.nombre_completo}</h2>

      {/* Contenedor de gráficos */}
      <div className="graficos-contenedor">
        <div className="grafico-tarjeta">
          <h4>Logro por OA</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dataLogroPorOA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="OA" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="promedioLogro" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grafico-tarjeta">
          <h4>Logro por Dificultad</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dataLogroPorDificultad}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dificultad" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="promedioLogro" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grafico-tarjeta">
          <h4>Distribución de Habilidades</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dataHabilidades}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dataHabilidades.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Contenedor de la tabla */}
      <div className="tabla-contenedor">
        <div className="tabla-tarjeta">
          <h4>Detalle por Pregunta</h4>
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
        </div>
      </div>
    </div>
  );
};

export default VerEstadisticas;

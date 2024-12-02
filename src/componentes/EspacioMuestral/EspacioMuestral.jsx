import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarraProgreso, Resumen } from "../indice";
import './EspacioMuestral.css';

const simbolosImportados = import.meta.glob('./simbolos/*.png', { eager: true });
const simbolosOrdenados = Object.entries(simbolosImportados)
  .sort(([pathA], [pathB]) => {
    const numA = parseInt(pathA.match(/(\d+)\.png$/)[1]);
    const numB = parseInt(pathB.match(/(\d+)\.png$/)[1]);
    return numA - numB;
  })
  .map(([, module]) => module.default);

const simbolosPosibles = simbolosOrdenados;

const EspacioMuestral = ({ etapa, marcarCompletada }) => {
  const id_etapa = etapa.id_etapa;
  const id_nivel = etapa.id_nivel;

  const [numeroEtapa, setNumeroEtapa] = useState(1);
  const [tiempoInicio, setTiempoInicio] = useState(Date.now());
  const [tiempoTotal, setTiempoTotal] = useState(0);
  const [resultados, setResultados] = useState([]);
  const [barajaInicial, setBarajaInicial] = useState([]);
  const [simbolosRecuadro, setSimbolosRecuadro] = useState([]);
  const [espacioMuestral, setEspacioMuestral] = useState([]);
  const [mostrarResumen, setMostrarResumen] = useState(false);
  const [mensajeRetroalimentacion, setMensajeRetroalimentacion] = useState('');
  const [mostrarRetroalimentacion, setMostrarRetroalimentacion] = useState(false);
  const [cuentaRegresiva, setCuentaRegresiva] = useState(3);
  const [mostrarPregunta, setMostrarPregunta] = useState(false);
  const [simbolosColumnaDerecha, setSimbolosColumnaDerecha] = useState([]);

  const navegar = useNavigate();

  // Cuenta regresiva antes de cada pregunta
  useEffect(() => {
    if (cuentaRegresiva > 0) {
      const timer = setTimeout(() => setCuentaRegresiva((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setMostrarPregunta(true);
      setTiempoInicio(Date.now());
    }
  }, [cuentaRegresiva]);

  // Configura la baraja inicial para cada etapa y muestra inmediatamente los símbolos en recuadro-principal
  useEffect(() => {
    if (!mostrarPregunta) return;

    let cantidadSimbolos = 0;
    if (numeroEtapa === 1) cantidadSimbolos = 5;
    else if (numeroEtapa === 2) cantidadSimbolos = 7;
    else if (numeroEtapa === 3) cantidadSimbolos = 9;

    const nuevosSimbolos = simbolosPosibles
      .sort(() => 0.5 - Math.random())
      .slice(0, cantidadSimbolos);

    setBarajaInicial(nuevosSimbolos);
    setSimbolosRecuadro(nuevosSimbolos); // Establece inmediatamente los símbolos
    setEspacioMuestral([]);
  }, [numeroEtapa, mostrarPregunta]);

  // Mezcla los símbolos de `simbolosRecuadro` cada 1.5 segundos para mantener el orden dinámico
  useEffect(() => {
    if (!mostrarPregunta) return;

    const interval = setInterval(() => {
      setSimbolosRecuadro((prevSimbolos) => [...prevSimbolos].sort(() => 0.5 - Math.random()));
    }, 1500);

    return () => clearInterval(interval);
  }, [barajaInicial, mostrarPregunta]);

  // Mezcla y muestra todos los símbolos para la columna derecha
  useEffect(() => {
    const mezclarSimbolosColumnaDerecha = () => {
      setSimbolosColumnaDerecha([...simbolosPosibles].sort(() => 0.5 - Math.random()));
    };
    
    mezclarSimbolosColumnaDerecha();
  }, [mostrarPregunta]);

  // Función para agregar un símbolo al espacio muestral
  const handleAgregarResultado = (simbolo) => {
    if (!espacioMuestral.includes(simbolo)) {
      setEspacioMuestral([...espacioMuestral, simbolo]);
    }
  };

  // Función para eliminar un símbolo del espacio muestral
  const handleRemoveResultado = (simbolo) => {
    setEspacioMuestral((prevEspacio) => prevEspacio.filter((s) => s !== simbolo));
  };

  const verificarRespuesta = () => {
    const simbolosEspacioMuestral = espacioMuestral.slice().sort();
    const simbolosCorrectos = barajaInicial.slice().sort();

    const esCorrecto =
      simbolosEspacioMuestral.length === simbolosCorrectos.length &&
      simbolosEspacioMuestral.every((simbolo, index) => simbolo === simbolosCorrectos[index]);

    if (esCorrecto) {
      const tiempoRespuesta = (Date.now() - tiempoInicio) / 1000;
      
      setResultados((prevResultados) => [
        ...prevResultados,
        { correcta: true, tiempo: tiempoRespuesta },
      ]);
      setTiempoTotal((prevTiempoTotal) => prevTiempoTotal + tiempoRespuesta);
      
      siguienteEtapa();
    } else {
      setMensajeRetroalimentacion(
        '¡Casi lo logras! Pero ese no es el espacio muestral de este experimento.'
      );
      setMostrarRetroalimentacion(true);
    }
  };

  const cerrarRetroalimentacion = () => {
    setMostrarRetroalimentacion(false);
    setEspacioMuestral([]);
    setMostrarPregunta(true);
    setTiempoInicio(Date.now());
  };

  const siguienteEtapa = () => {
    if (numeroEtapa < 3) {
      setNumeroEtapa(numeroEtapa + 1);
      setCuentaRegresiva(3);
      setMostrarPregunta(false);
    } else {
      setMostrarResumen(true);
    }
  };

  const reiniciarQuiz = () => {
    setResultados([]);
    setTiempoTotal(0);
    setNumeroEtapa(1);
    setMostrarResumen(false);
    setCuentaRegresiva(3);
    setMostrarPregunta(false);
  };

  const continuarQuiz = () => {
    if (id_nivel) {
      if (typeof marcarCompletada === 'function') {
        marcarCompletada();
      }
      navegar(`/nivel/${id_nivel}`);
    } else {
      console.error("id_nivel no está definido.");
    }
  };

  const porcentajeProgreso = ((numeroEtapa - 1) / 3) * 100;

  return (
    <div className="espacio-muestral-container">
      {mostrarResumen ? (
        <Resumen 
          resultados={resultados} 
          tiempoTotal={tiempoTotal} 
          totalPreguntas={3} 
          reiniciarQuiz={reiniciarQuiz} 
          continuarQuiz={continuarQuiz}
          id_etapa={id_etapa}
        />
      ) : (
        <>
          {cuentaRegresiva > 0 && !mostrarPregunta ? (
            <div className="cuenta-regresiva">
              <p>Prepárate... {cuentaRegresiva}</p>
            </div>
          ) : (
            <div className="contenedor-izquierdo">
              <BarraProgreso progreso={porcentajeProgreso} />
              <div className="instrucciones">
                <p>
                  Descubre todos los posibles resultados del experimento y agrégalos en el espacio muestral.
                </p>
              </div>
              <div className="recuadro-principal">
                <p>Etapa {numeroEtapa}</p>
                <div className="simbolos-recuadro">
                  {simbolosRecuadro.map((simbolo, index) => (
                    <div key={index} className="simbolo-recuadro">
                      <img src={simbolo} alt={`Símbolo ${index + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="espacio-muestral">
                <h2>Espacio muestral (todos los posibles resultados)</h2>
                <div className="resultados">
                  {espacioMuestral.map((simbolo, index) => (
                    <div 
                      key={index} 
                      className="simbolo" 
                      onClick={() => handleRemoveResultado(simbolo)} 
                      title="Haz clic para eliminar este símbolo"
                    >
                      <img src={simbolo} alt={`Símbolo seleccionado ${index + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="barra-inferior">
                <button onClick={verificarRespuesta}>Comprobar</button>
              </div>
            </div>
          )}

          {mostrarPregunta && (
            <div className="columna-simbolos">
              {simbolosColumnaDerecha.map((simbolo, index) => (
                <div
                  key={index}
                  className="simbolo"
                  onClick={() => handleAgregarResultado(simbolo)}
                  title="Haz clic para agregar este símbolo"
                >
                  <img src={simbolo} alt={`Símbolo ${index + 1}`} />
                </div>
              ))}
            </div>
          )}
          
          {mostrarRetroalimentacion && (
            <div className="retroalimentacion">
              <p>{mensajeRetroalimentacion}</p>
              <button onClick={cerrarRetroalimentacion}>Intentar de nuevo</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EspacioMuestral;

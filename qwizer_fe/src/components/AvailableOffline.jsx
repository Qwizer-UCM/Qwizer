import localforage from 'localforage';
import { useEffect, useState } from 'react';
import TarjetaCuestionario from './TarjetaCuestionario';

const AvailableOffline = ({ role }) => {
  const [cuestionarios,setCuestionarios] = useState({});

  useEffect(() => {
    localforage.getItem('tests').then(value => {
      if (value) {
        setCuestionarios(value)
      }
    })
  }, [])
  

  if (Object.keys(cuestionarios)?.length !== 0) {
    return (
      <div className="index-body">
        <div className="section-title">
          <h1>Cuestionarios Descargados</h1>
        </div>
        {Object.entries(cuestionarios).map(([id,cuestionario]) => (
          <div key={id} className="d-flex justify-content-center">
            <TarjetaCuestionario offline cuestionario={cuestionario} idCuestionario={id} role={role} />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="index-body">
      <div className="section-title">
        <h1>Cuestionarios Descargados</h1>
        <div className="text-center">
          <h4>No tienes descargado ningun Test</h4>
        </div>
      </div>
    </div>
  );
};

export default AvailableOffline;

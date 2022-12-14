import { useState } from 'react';
import TarjetaCuestionario from './TarjetaCuestionario';

const AvailableOffline = ({ role }) => {
  const [cuestionarios] = useState(() => JSON.parse(localStorage.getItem('tests')) || []);

  if (Object.keys(cuestionarios)?.length !== 0) {
    return (
      <div className="index-body row">
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
    <div className="index-body row">
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

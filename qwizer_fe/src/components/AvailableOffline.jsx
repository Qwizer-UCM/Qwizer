import { useState } from 'react';
import TarjetaCuestionario from './TarjetaCuestionario';

const AvailableOffline = ({ role }) => {
  const [cuestionarios] = useState(() => JSON.parse(localStorage.getItem('tests'))?.map((c) => JSON.parse(c)) || []);

  if (cuestionarios?.length !== 0) {
    return (
      <div className="index-body row">
        <div className="section-title">
          <h1>Cuestionarios Descargados</h1>
        </div>
        {cuestionarios.map((cuestionario) => (
          <div key={cuestionario.id} className="d-flex justify-content-center">
            <TarjetaCuestionario offline cuestionario={cuestionario} idCuestionario={cuestionario.id} role={role} />
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

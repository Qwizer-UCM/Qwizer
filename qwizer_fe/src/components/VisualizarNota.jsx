import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';
import useFetch from '../hooks/useFetch';
import { Otro } from '../services/API';

export default function VisualizarNota({ data: cuestionario }) {
  const { data } = useFetch(Otro.getHashes, { params: { idCuestionario: cuestionario.idCuestionario, idUsuario: cuestionario.id } });
  const { corrected: corregido, hashSubida, qrSent, hashQr } = data ?? {};

  if (!data) return null;

  return (
    <div className="ps-3 pt-3">
      {corregido === true && (
        <div className="form-group">
          <label htmlFor="name" className="col-lg-4">
            Hash generado tras la corrección:
          </label>
          <div className="col-lg-8">
            <input type="text" className="form-control" value={hashSubida} disabled />
          </div>
        </div>
      )}

      {corregido === false && <p>Este exámen aun no ha sido corregido.</p>}

      {qrSent === true && (
        <div className="form-group">
          <label htmlFor="name" className="col-lg-4">
            Hash generado mediante el codigo QR:
          </label>
          <div className="col-lg-8">
            <input type="text" className="form-control" value={hashQr} disabled />
          </div>
        </div>
      )}

      {qrSent === false && <p>El alumno no hizo uso del código QR.</p>}

      {qrSent === true && corregido === true && hashSubida === hashQr && (
        <p>
          <CheckIcon color="primary" /> Los códigos coinciden
        </p>
      )}

      {qrSent === true && corregido === true && hashSubida !== hashQr && (
        <p>
          <ErrorIcon color="primary" /> Los códigos no coinciden
        </p>
      )}
    </div>
  );
}

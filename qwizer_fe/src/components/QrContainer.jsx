import QRCode from 'react-qr-code';
import { useParams } from 'react-router-dom';
import { routes } from '../constants';

const QrContainer = ({ userId }) => {
  const params = useParams();
  
  return (
    <div className="index-body">
      <div className="d-flex justify-content-center mt-3">
        <h4>Actualmente te encuentras sin conexión a internet</h4>
      </div>
      <div className="d-flex justify-content-center">
        <p>Se ha generado un código QR para que se lo muestres al profesor</p>
      </div>
      <div className="d-flex justify-content-center mt-4">
        <QRCode value={`${window.location.protocol}//${window.location.host}${routes.PATH_QR_INSERT(userId,params.test,params.hash,params.resp)}`} />
      </div>
    </div>
  );
};

export default QrContainer;

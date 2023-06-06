import QRCode from 'react-qr-code';
import { useParams } from 'react-router-dom';
import { PATH_QR_INSERT } from '../constants';

const QrContainer = ({ userId }) => {
  const params = useParams();
  const link = `${window.location.protocol}//${window.location.host}${PATH_QR_INSERT(userId,params.test,params.hash)}`
  console.log(userId);
  return (
    <div className="index-body">
      <div className="d-flex justify-content-center mt-3">
        <h4>Actualmente te encuentras sin conexión a internet</h4>
      </div>
      <div className="d-flex justify-content-center">
        <p>Se ha generado un código QR para que se lo muestres al profesor</p>
      </div>
      <div className="d-flex flex-column align-items-center mt-4">
        <QRCode value={link} />
        <a href={link} className='mt-2'>{link}</a>
      </div>
    </div>
  );
};

export default QrContainer;

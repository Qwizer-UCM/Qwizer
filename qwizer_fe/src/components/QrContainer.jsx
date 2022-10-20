import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { useParams } from 'react-router-dom';

const QrContainer = ({ userId }) => {
  const params = useParams();
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(`${window.location.protocol}//${window.location.host}/scanner/${userId}/${params.test}/${params.hash}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="index-body">
      <div className="d-flex justify-content-center mt-3">
        <h4>Actualmente te encuentras sin conexión a internet</h4>
      </div>
      <div className="d-flex justify-content-center">
        <p>Se ha generado un código QR para que se lo muestres al profesor</p>
      </div>
      <div className="d-flex justify-content-center mt-4">
        <QRCode value={url} />
      </div>
    </div>
  );
};

export default QrContainer;

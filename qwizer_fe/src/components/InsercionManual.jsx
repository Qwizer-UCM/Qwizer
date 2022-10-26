import { useParams } from 'react-router-dom';
import SuccessModal from './common/modals/SuccessModal';
import ErrorModal from './common/modals/ErrorModal';
import { Otro } from '../services/API';
import useFetch from '../hooks/useFetch';

const InsercionManual = ({ userId }) => {
  const params = useParams();
  const onSuccess = () => window.$(!inserted ? '#inserted_error' : '#inserted_success').modal('show');
  const { data } = useFetch(Otro.insertQR, { params: { idUsuario: userId, idCuestionario: params.test, hash: params.hash }, onSuccess });
  const { message, inserted } = data ?? {};

  return (
    <div className="index-body">
      <div className="d-flex justify-content-center mt-4">
        <h4>Escaneado de códigos QR</h4>
      </div>
      <ErrorModal id="inserted_error" message={message} />
      <SuccessModal id="inserted_success" message={message} />
    </div>
  );
};

export default InsercionManual;

import { useParams } from 'react-router-dom';
import { useState } from 'react';
import Modal from './common/modals/Modal';
import { Otro } from '../services/API';
import useFetch from '../hooks/useFetch';

const InsercionManual = ({ userId }) => {
  const params = useParams();
  const [errorModal, setErrorModal] = useState({ show: false });
  const [successModal, setSuccessModal] = useState({ show: false });

  const onSuccess = () => (!inserted ? setErrorModal({ show: true }) : setSuccessModal({ show: true }));
  const { data } = useFetch(Otro.insertQR, { params: { idUsuario: userId, idCuestionario: params.test, hash: params.hash}, onSuccess });
  const { message, inserted } = data ?? {};

  return (
    <div className="index-body">
      <div className="d-flex justify-content-center mt-4">
        <h4>Escaneado de códigos QR</h4>
      </div>
      <Modal options={{ show: errorModal.show, message }} onHide={setErrorModal} type="danger" />
      <Modal options={{ show: successModal.show, message }} onHide={setSuccessModal} type="success" />
    </div>
  );
};

export default InsercionManual;

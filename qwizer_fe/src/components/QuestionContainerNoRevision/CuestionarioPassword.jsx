import CryptoJS from 'crypto-js';
import { useState } from 'react';
import Modal from '../common/modals/Modal';

const CuestionarioPassword = ({ unlockTest, localStorageTest }) => {
  const [contra, setContra] = useState('');
  const [errorModal, setErrorModal] = useState({ show: false, message: '' });

  const descifrarTest = (input) => {
    const cipher = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(input.encrypted_message),
    });
    const key = CryptoJS.enc.Hex.parse(input.password);
    const iv = CryptoJS.enc.Hex.parse(input.iv);

    const result = CryptoJS.AES.decrypt(cipher, key, { iv, mode: CryptoJS.mode.CFB });
    console.log(result.toString(CryptoJS.enc.Utf8));
    return JSON.parse(result.toString(CryptoJS.enc.Utf8));
  };

  const startTest = () => {
    if (contra !== '' && CryptoJS.SHA256(contra).toString() === localStorageTest.password) {
      const questions = descifrarTest(localStorageTest);
      unlockTest(questions);
    } else {
      setErrorModal({ show: true, message: 'Contraseña incorrecta' });
    }
  };

  return (
    <div className="index-body">
      <div className="card tabla-notas">
        <div className="card-content">
          <div className="col text-center">
            <h3>Introduce la contraseña para empezar el examen!</h3>
          </div>

          <div className="p-4 row">
            <div className="col text-center">
              <input type="text" className="center form-control" onChange={(e) => setContra(e.target.value)} />
            </div>
          </div>
          <div className="p-4 row">
            <div className="col text-center">
              <button type="button" className="btn btn-success" onClick={startTest}>
                Empezar Test
              </button>
            </div>
          </div>
        </div>
      </div>
      <Modal options={errorModal} onHide={setErrorModal} type="danger" />
    </div>
  );
};

export default CuestionarioPassword;

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SuccessModal from "./common/modals/SuccessModal";
import ErrorModal from "./common/modals/ErrorModal";
import Otro from "../services/NoSeDondeMeterloTodavia";

const InsercionManual = ({userId}) => {
  const params = useParams();
  const [message, setmessage] = useState("");

  useEffect(() => {
    guardarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const guardarDatos = () => {
    Otro.insertQR(userId,params.test,params.hash)
      .then(({data}) => {
        setmessage(data.message);
        if (!data.inserted) {
          window.$("#inserted_error").modal("show");
        } else {
          window.$("#inserted_success").modal("show");
        }
      })
      .catch((error) => console.log(error));
  };

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

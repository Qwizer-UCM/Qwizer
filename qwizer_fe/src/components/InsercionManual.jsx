import React from "react";
import ErrorModal from "./common/modals/ErrorModal";
import SuccessModal from "./common/modals/SuccessModal";
import { API_URL } from "../constants/Constants";
import { useEffect } from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import Otro from "../services/NoSeDondeMeterloTodavia";

const InsercionManual = (props) => {
  const params = useParams();
  const [message, setmessage] = useState("");

  useEffect(() => {
    guardarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const guardarDatos = () => {
    Otro.insertQR(props.userId,params.test,params.hash)
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
      <ErrorModal id={"inserted_error"} message={message}></ErrorModal>
      <SuccessModal id={"inserted_success"} message={message}></SuccessModal>
    </div>
  );
};

export default InsercionManual;

import React, { useState } from "react";
import ErrorModal from "./common/modals/ErrorModal";
import SuccessModal from "./common/modals/SuccessModal";
import { API_URL } from "../constants/Constants";
import Tests from "../services/Tests";

const UploadFile = () => {
  const [file, setFile] = useState("");
  const [message, setMessage] = useState(undefined);

  const uploadFile = () => {
    if (file.name !== "") {
      let reader = new FileReader();
      reader.readAsText(file, "utf-8");
      reader.onload = (e) => {
        const fichero_yaml = e.target.result;

        Tests.upload(fichero_yaml)
          .then(({ data }) => {
            setFile("");
            setMessage(data.message);
            if (data.inserted === "false") {
              window.$("#inserted_error").modal("show");
            } else {
              window.$("#inserted_success").modal("show");
            }
          })
          .catch((error) => console.log(error));
      };
    }
  };

  return (
    <div className="upload-body">
      <div className="card upload-section ">
        <div className="header bg-blue-grey">
          <h2>Sube tu cuestionario en formato : YAML</h2>
        </div>
        <div className="upload-inner-body">
          <h4>
            <label htmlFor="myfile">Selecciona un archivo:</label>
          </h4>
          <div className="input-group">
            <div className="custom-file">
              <input type="file" className="custom-file-input" aria-describedby="inputGroupFileAddon01" onChange={(e) => setFile(e.target.files[0])} id="myfile" name="myfile" />
              <label className="custom-file-label" htmlFor="inputGroupFile01">
                {file.name}
              </label>
            </div>
          </div>
          <div className="upload-message-section">
            {file !== "" && (
              <button type="button" className="btn btn-success btn-submit" onClick={uploadFile}>
                Subir Cuestionario
              </button>
            )}
          </div>
        </div>
      </div>
      <ErrorModal id={"inserted_error"} message={message}></ErrorModal>
      <SuccessModal id={"inserted_success"} message={message}></SuccessModal>
    </div>
  );
};

export default UploadFile;

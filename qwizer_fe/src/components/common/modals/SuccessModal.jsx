const SuccessModal = ({id, message}) => {
  const closeModal = () => {
    window.$(id).modal("hide");
  }

  return (
    <div className="modal fade" id={id} tabIndex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header success-modal-header">
            <h5 className="modal-title" id="exampleModalLongTitle">Todo ha ido bien</h5>
            <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close" onClick={closeModal}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {message}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-success" data-bs-dismiss="modal" onClick={closeModal}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );


}

export default SuccessModal;
import React from 'react'


const ErrorModal = (props) => {


  const close_modal = () => {
    window.$(props.id).modal("hide");
  }


  return (
    <div className="modal fade" id={props.id} tabIndex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header error-modal-header">
            <h5 className="modal-title" id="exampleModalLongTitle">Error</h5>
            <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close" onClick={close_modal}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {props.message}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-error" data-bs-dismiss="modal" onClick={close_modal}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );


}

export default ErrorModal;
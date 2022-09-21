import React from 'react'


//FIXME CHANGE TO FUNCTION
class ErrorModal extends React.Component {
    
  constructor(props){
    super(props);

    this.close_modal = this.close_modal.bind(this);
  }

  close_modal = () => {
    window.$(this.props.id).modal("hide");
  }
  
  render() { 
            return(
                <div className="modal fade" id={this.props.id} tabIndex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                        <div className="modal-header error-modal-header">
                            <h5 className="modal-title" id="exampleModalLongTitle">Error</h5>
                            <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close" onClick={this.close_modal}>
                            <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            {this.props.message}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-error" data-bs-dismiss="modal" onClick={this.close_modal}>Cerrar</button>
                        </div>
                        </div>
                    </div>
                </div>
            );                
  }

}

export default ErrorModal;
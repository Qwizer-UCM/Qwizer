import { Modal as BSModal } from 'bootstrap';
import { useEffect, useRef } from 'react';

// TODO se puede usar solo uno en todos los componentes, pero se dejan dos por dejarlo como estaba antes.
const Modal = ({ options: { show, message } = {}, onHide: setShow, type }) => {
  const modalRef = useRef();

  useEffect(() => {
    const modal = modalRef.current;
    const bsModal = new BSModal(modal);
    if (show) {
      bsModal.show();
    } else {
      bsModal.hide();
    }

    modal.addEventListener('hidden.bs.modal', closeModal);

    return () => {
      modal.removeEventListener('hidden.bs.modal', closeModal);
      bsModal.hide();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const closeModal = () => {
    setShow((old) => ({ ...old, show: false }));
  };

  const bgColor = type === 'danger' ? 'bg-danger text-bg-danger' : 'bg-success text-bg-success';
  const title = type === 'danger' ? 'Error' : 'Correcto';
  const btnColor = type === 'danger' ? 'btn-danger' : 'btn-success';

  return (
    <div className="modal fade" ref={modalRef} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className={`modal-header ${bgColor}`}>
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={closeModal} />
          </div>
          <div className="modal-body">{message}</div>
          <div className="modal-footer">
            <button type="button" className={`btn ${btnColor}`} data-bs-dismiss="modal" onClick={closeModal}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;

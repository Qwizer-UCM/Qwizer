import { useRef, useState } from 'react';
import Modal from './common/modals/Modal';
import { Tests } from '../services/API';

const UploadTest = () => {
    const wrapper = useRef(null)
    const [file, setFile] = useState('');
    const [errorModal, setErrorModal] = useState({ show: false, message: '' });
    const [successModal, setSuccessModal] = useState({ show: false, message: '' });


    const uploadFile = () => {
        if (file.name !== '') {
            const reader = new FileReader();
            reader.readAsText(file, 'utf-8');
            reader.onload = (e) => {
                const ficheroYAML = e.target.result;

                Tests.upload({ ficheroYAML })
                    .then(({ data }) => {
                        setFile('');
                        if (data.inserted === 'false') {
                            setErrorModal({ show: true, message: data.message });
                        } else {
                            setSuccessModal({ show: true, message: data.message });
                        }
                    })
                    .catch((error) => {
                        setErrorModal({ show: true, message: error.response.data?.message ?? "Error" });
                        console.log(error);
                    });
            };
        }
    };

    const onDragEnter = () => wrapper.current.classList.add('dragover')

    const onDragLeave = () => wrapper.current.classList.remove('dragover')

    const onDrop = () => wrapper.current.classList.remove('dragover')

    const handleDeleteFile = () => setFile('')

    return (
        <div className="upload-body">
            <div className="card m-auto">
                <div className="card-header header bg-blue-grey">
                    <h2>Sube tu cuestionario en formato : YAML</h2>
                </div>
                <div className="card-body drag-and-drop-component"
                    ref={wrapper}
                    onDragEnter={onDragEnter}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}>
                    <div className='text-center'>
                        <span className='material-icons' style={{ fontSize: "120px", width: "100px" }}>cloud_upload</span>
                        <p className='drag-and-drop-component-text'>Arrastre y suelte aquí su fichero con el cuestionario</p>
                    </div>
                    <input type="file" onChange={(e) => setFile(e.target.files[0])} id="myfile" name="myfile" />

                </div>

                <div className="upload-message-section">
                    {file !== '' && (
                        <div className='text-center'>
                            <div className='file-preview'>

                                <p className='file-preview-file'>
                                    <span className='material-icons' style={{ fontSize: "40px", width: "50px", marginRight: "20px" }}>description</span>
                                    {file.name.length > 15 ? `${file.name.substr(0, 15)} ...` : file.name}
                                    <span className="material-icons file-preview-del" onClick={handleDeleteFile}>delete</span>
                                </p>
                            </div>
                            <button type="button" className="mb-2 btn btn-success" onClick={uploadFile}>
                                Subir Cuestionario
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <Modal options={errorModal} onHide={setErrorModal} type='danger' />
            <Modal options={successModal} onHide={setSuccessModal} type='success' />
        </div>
    );
};

export default UploadTest;

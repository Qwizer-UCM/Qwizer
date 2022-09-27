import React, { useEffect, useState } from 'react'
import QRCode from "react-qr-code";
import { useParams } from 'react-router-dom';



const QrContainer = (props) => {
    const params = useParams();
    const [url, setUrl] = useState("")

    //En futuro hay que adaptar la url
    useEffect(() => {
        let url = `${window.location.protocol}//${window.location.host}/scanner/${props.userId}/${params.test}/${params.hash}`;
        setUrl(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    //Recordemos que este era willMount puede ser que falle
    /*
    componentWillMount(){
        generateUrl()  
    }
    */
    return (
        <div className='index-body'>
            <div className='d-flex justify-content-center mt-3'>
                <h4>Actualmente te encuentras sin conexión a internet</h4>
            </div>
            <div className='d-flex justify-content-center'>
                <p>Se ha generado un código QR para que se lo muestres al profesor</p>
            </div>
            <div className='d-flex justify-content-center mt-4'>
                <QRCode value={url} />
            </div>
        </div>
    );


}

export default QrContainer;
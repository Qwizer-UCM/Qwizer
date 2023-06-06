import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Buffer } from 'buffer';
import App from './App';


// Bootstrap CSS
// import 'bootstrap/dist/css/bootstrap.min.css';
// Bootstrap Bundle JS
// TODO conflicto con import del Modal, si se importa deja de funcionar el popover del navbar
// puede ser que no sea necesario a menos que hagamos uso explicito de popovers fuera de un navbar
// import 'bootstrap/dist/js/bootstrap.min'; 
import './css/main.css';
import './css/login.css';
import './css/index.css';
import './css/sidebar.css'

// @ts-ignore
window.Buffer = Buffer;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
        <App />
    </BrowserRouter>
  </StrictMode>
);

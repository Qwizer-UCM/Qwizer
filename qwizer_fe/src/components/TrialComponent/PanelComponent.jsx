import { Routes, Route } from "react-router-dom"
import Sidebar from "./Sidebar";
import UploadQuestions from "../UploadQuestions";
import CrearCuestionario from "../CrearCuestionario/CrearCuestionario";
import BancoPreguntas from "../BancoPreguntas";
import UploadTest from "../UploadTest";
import UploadNotas from "../UploadNotas";
import RegisterContainer from "../RegisterContainer";

import { BANCO_PREGUNTAS, CREAR_CUESTIONARIO, NOTAS, REGISTRO, SUBIR_CUESTIONARIO, SUBIR_PREGUNTAS } from "../../constants";



const PanelComponent = () => (
        <div className="wrapper-cuestionarios">
            <Sidebar/>
            <Routes>
                <Route index element={<UploadQuestions/>}/>
                <Route index path={SUBIR_PREGUNTAS} element={<UploadQuestions/>}/>
                <Route path={SUBIR_CUESTIONARIO} element={<UploadTest/>}/>
                <Route path={CREAR_CUESTIONARIO} element={<CrearCuestionario/>}/>
                <Route path={BANCO_PREGUNTAS} element={<BancoPreguntas/>}/>
                <Route path={REGISTRO} element={<RegisterContainer/>}/>
                <Route path={NOTAS} element={<UploadNotas/>}/>

            </Routes>
        </div>
    )



export default PanelComponent;
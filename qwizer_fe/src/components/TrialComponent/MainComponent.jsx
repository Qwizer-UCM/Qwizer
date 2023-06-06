import { Routes, Route } from "react-router-dom"
import Sidebar from "./Sidebar";
import UploadQuestions from "../UploadQuestions";
import CrearCuestionario from "../CrearCuestionario/CrearCuestionario";
import BancoPreguntas from "../BancoPreguntas";
import UploadTest from "../UploadTest";


const MainComponent = () => {
    const hola = ""
    return (
        <div className="wrapper-cuestionarios">
            <Sidebar/>
        <Routes>
            <Route path="/1" element={<UploadQuestions/>}/>
            <Route path="/2" element={<UploadTest/>}/>
            <Route path="/3" element={<CrearCuestionario/>}/>
            <Route path="/4" element={<BancoPreguntas/>}/>
        </Routes>
        </div>
    )

}

export default MainComponent;
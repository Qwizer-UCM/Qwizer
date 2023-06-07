import { useState } from "react";
import { NavLink } from "react-router-dom";
import { BANCO_PREGUNTAS, CREAR_CUESTIONARIO, NOTAS, REGISTRO, SUBIR_CUESTIONARIO, SUBIR_PREGUNTAS } from "../../constants";

const Sidebar = () => {
    const [sidebar, setSidebar] = useState(false);

    const showSidebar = () => setSidebar(!sidebar)

    return (
        <>
            <button type="button" className="icons-order" onClick={showSidebar}><span className="material-icons-outlined">reorder</span></button>
            <nav className={sidebar ? 'side-menu active' : 'side-menu'}>
                <ul className="side-menu-items">
                    <li className="sidebar-text" >
                        <button type="button" className="icons" onClick={showSidebar}><span className="material-icons-outlined ">close</span></button>
                    </li>
                    <li className="sidebar-text">
                        <NavLink to={REGISTRO}>Añadir alumno</NavLink>
                    </li>
                    <li className="sidebar-text" >
                        <NavLink to={SUBIR_PREGUNTAS} >Subir preguntas</NavLink>
                    </li>
                    <li className="sidebar-text" >
                        <NavLink to={SUBIR_CUESTIONARIO} >Subir test</NavLink>
                    </li>
                    <li className="sidebar-text" >
                        <NavLink to={CREAR_CUESTIONARIO}>Crear cuestionarios</NavLink>
                    </li>
                    <li className="sidebar-text" >
                        <NavLink to={BANCO_PREGUNTAS} >Banco de preguntas</NavLink>
                    </li>
                    <li className="sidebar-text">
                        <NavLink to={NOTAS}>Notas</NavLink>
                    </li>

                </ul>

            </nav>
        </>
    )

}

export default Sidebar;
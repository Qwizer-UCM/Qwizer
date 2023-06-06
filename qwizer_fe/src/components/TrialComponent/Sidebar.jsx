import { useState } from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
    const [sidebar, setSidebar] = useState(false);

    const showSidebar = () => setSidebar(!sidebar)

    return (
        <>
            <button type="button" className="icons-order" onClick={showSidebar}><span className="material-icons-outlined">reorder</span></button>
            <aside>
                <nav className={sidebar ? 'side-menu active' : 'side-menu'}>
                    <ul className="side-menu-items">
                        <li className="sidebar-text" >
                            <button type="button" className="icons"  onClick={showSidebar}><span className="material-icons-outlined ">close</span></button>
                        </li>
                        <li className="sidebar-text" >
                            <NavLink to="/cuestionariostest/1" >Subir preguntas</NavLink>
                        </li>
                        <li className="sidebar-text" >
                            <NavLink to="/cuestionariostest/2" >Subir test</NavLink>
                        </li>
                        <li className="sidebar-text" >
                            <NavLink to="/cuestionariostest/3">Crear cuestionarios</NavLink>
                        </li>
                        <li className="sidebar-text" >
                            <NavLink to="/cuestionariostest/4" >Banco de preguntas</NavLink>
                        </li>

                    </ul>

                </nav>
            </aside>
        </>
    )

}

export default Sidebar;
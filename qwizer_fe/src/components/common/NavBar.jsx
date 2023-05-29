import { NavLink } from 'react-router-dom';
import { BANCO_PREGUNTAS, CREAR_CUESTIONARIO, INICIO, NOTAS, OFFLINE, REGISTRO, SUBIR_CUESTIONARIO, SUBIR_PREGUNTAS } from '../../constants';

const NavBar = ({ role, username, logout, isOffline }) => (
  <nav className="navbar navbar-expand-lg  bg-light">
    <div className="container-fluid">
      <NavLink to={INICIO} className="navbar-brand">
        Qwizer <span className={`material-icons fs-5 align-middle rounded shadow  p-1 ${isOffline ? 'bg-danger' : 'bg-success text-white'}`}>{!isOffline ? 'wifi' : 'wifi_off'}</span>
      </NavLink>
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon" />
      </button>
      <div className="collapse navbar-collapse" id="navbarText">
        <ul className="navbar-nav me-auto">
          <li className="nav-item">
            <NavLink to={INICIO} className="nav-link">
              Inicio <span className="sr-only" />
            </NavLink>
          </li>
          {!isOffline && (
            <>
              {role === 'teacher' && (
                <>
                  <li className="nav-item">
                    <NavLink to={REGISTRO} className="nav-link">
                      Añadir alumno
                      <span className="sr-only" />
                    </NavLink>
                  </li>
                  <li className="nav-item dropdown ">
                    <a href="##" className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                      Crear cuestionarios
                    </a>
                    <ul className="dropdown-menu" style={{ margin: 0 }}>
                      <li>
                        <NavLink to={SUBIR_PREGUNTAS} className="dropdown-item">
                          Subir preguntas
                          <span className="sr-only" />
                        </NavLink>
                      </li>
                      <NavLink to={SUBIR_CUESTIONARIO} className="dropdown-item">
                        Subir test <span className="sr-only" />
                      </NavLink>
                      <NavLink to={CREAR_CUESTIONARIO} className="dropdown-item">
                        Crear cuestionario
                        <span className="sr-only" />
                      </NavLink>
                      <NavLink to={BANCO_PREGUNTAS} className="dropdown-item">
                        Banco de preguntas
                        <span className="sr-only" />
                      </NavLink>
                    </ul>
                  </li>
                  <li className="nav-item">
                    <NavLink to={NOTAS} className="nav-link">
                      Notas
                      <span className="sr-only" />
                    </NavLink>
                  </li>
                </>
              )}
              <li className="nav-item">
                <NavLink to={OFFLINE} className="nav-link">
                  Offline
                  <span className="sr-only" />
                </NavLink>
              </li>
             
            </>
          )}
        </ul>
        <div className="nav-item dropdown ">
          <a href="##" className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" data-bs-display="static" aria-expanded="false">
            {username}
          </a>
          <div className="dropdown-menu dropdown-menu-lg-end" aria-labelledby="navbarDropdownMenuLink" style={{ margin: 0 }}>
            <button type="button" className="dropdown-item" onClick={logout}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
);

export default NavBar;

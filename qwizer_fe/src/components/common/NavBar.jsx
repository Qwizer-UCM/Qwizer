import { Link } from 'react-router-dom';
import { BANCO_PREGUNTAS, CREAR_CUESTIONARIO, INICIO, NOTAS, OFFLINE, REGISTRO, SUBIR_CUESTIONARIO, SUBIR_PREGUNTAS } from '../../constants';

const NavBar = ({ role, username, logout, isOffline }) => (
  <nav className="navbar navbar-expand-lg  bg-light">
    <div className="container-fluid">
      <Link to={INICIO} className="navbar-brand">
        Qwizer <span className={`material-icons fs-5 align-middle rounded shadow  p-1 ${isOffline ? 'bg-danger' : 'bg-success text-white'}`}>{!isOffline ? 'wifi' : 'wifi_off'}</span>
      </Link>
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon" />
      </button>
      <div className="collapse navbar-collapse" id="navbarText">
        <ul className="navbar-nav me-auto">
          <li className="nav-item">
            <Link to={INICIO} className="nav-link active">
              Inicio <span className="sr-only" />
            </Link>
          </li>
          {!isOffline && (
            <>
              {role === 'teacher' && (
                <>
                  <li className="nav-item">
                    <Link to={REGISTRO} className="nav-link active">
                      Añadir alumno
                      <span className="sr-only" />
                    </Link>
                  </li>
                  <li className="nav-item dropdown ">
                    <a href="##" className="nav-link dropdown-toggle active" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                      Crear cuestionarios
                    </a>
                    <ul className="dropdown-menu" style={{ margin: 0 }}>
                      <li>
                        <Link to={SUBIR_PREGUNTAS} className="dropdown-item">
                          Subir preguntas
                          <span className="sr-only" />
                        </Link>
                      </li>
                      <Link to={SUBIR_CUESTIONARIO} className="dropdown-item">
                        Subir test <span className="sr-only" />
                      </Link>
                      <Link to={CREAR_CUESTIONARIO} className="dropdown-item">
                        Crear cuestionario
                        <span className="sr-only" />
                      </Link>
                      <Link to={BANCO_PREGUNTAS} className="dropdown-item">
                        Banco de preguntas
                        <span className="sr-only" />
                      </Link>
                    </ul>
                  </li>
                  <li className="nav-item">
                    <Link to={NOTAS} className="nav-link active">
                      Notas
                      <span className="sr-only" />
                    </Link>
                  </li>
                </>
              )}
              <li className="nav-item active">
                <Link to={OFFLINE} className="nav-link active">
                  Offline
                  <span className="sr-only" />
                </Link>
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

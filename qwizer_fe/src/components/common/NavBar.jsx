import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Favorite, Person } from '@mui/icons-material';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { BANCO_PREGUNTAS, CREAR_CUESTIONARIO, INICIO, NOTAS, OFFLINE, REGISTRO, SUBIR_CUESTIONARIO, SUBIR_PREGUNTAS } from '../../constants';



const BottomNavigationBar = ({ role, username, logout, isOffline }) => {
  const [value, setValue] = useState(0);
  return (
    <BottomNavigation sx={{ width: '100%', position: 'absolute', bottom: 0 }} value={value} onChange={(event, newValue) => setValue(newValue)} className="navbar-mobile">
      <BottomNavigationAction component={NavLink} to={INICIO} label='Inicio' icon={<Home/>} />

      {role === 'teacher' && !isOffline && <BottomNavigationAction component={NavLink} to={REGISTRO} label='Alumnos' icon={<Favorite />} />}
      
      {role === 'teacher' && !isOffline && <BottomNavigationAction component={NavLink} to="/cuestionariostest/1" label='Cuestionarios' icon={<Person />} />}

      {role === 'teacher' && !isOffline && <BottomNavigationAction component={NavLink} to={NOTAS} label='Notas' icon={<Person />} />}
      
      

      <BottomNavigationAction component={NavLink} to={OFFLINE} label='Cuenta' icon={<Person />} />
    </BottomNavigation>
  )
}

const NormalNavbar = ({ role, username, logout, isOffline }) => (
  <nav className="navbar navbar-expand-lg bg-light navbar-desktop">
    <div className="container-fluid">
      <NavLink to={INICIO} className="navbar-brand">
        Qwizer <span className={`material-icons fs-5 align-middle rounded shadow  p-1 ${isOffline ? 'bg-danger' : 'bg-success text-white'}`}>{!isOffline ? 'wifi' : 'wifi_off'}</span>
      </NavLink>
      <div className="collapse navbar-collapse" id="navbarText">
        <ul className="navbar-nav me-auto">
          <li className="nav-item">
            <NavLink to={INICIO} className="nav-link" end>
              <span className="material-icons-outlined">home</span>
              <span>Inicio</span>
            </NavLink>
          </li>
          {!isOffline && (
            <>
              {role === 'teacher' && (
                <>
                  <li className="nav-item">
                    <NavLink to={REGISTRO} className="nav-link">
                      <span className="material-icons-outlined">person_add</span>
                      <span>Añadir alumno</span>
                    </NavLink>
                  </li>
                  <li className="nav-item dropdown ">
                    <a href="##" className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <span className="material-icons-outlined">quiz</span>
                      <span>Cuestionarios</span>
                    </a>
                    <ul className="dropdown-menu" style={{ margin: 0 }}>
                      <li>
                        <NavLink to={SUBIR_PREGUNTAS} className="dropdown-item">
                          <span>Subir preguntas</span>
                          <span className="material-icons-outlined">post_add</span>
                        </NavLink>
                      </li>
                      <NavLink to={SUBIR_CUESTIONARIO} className="dropdown-item">
                        <span>Subir test</span>
                        <span className="material-icons-outlined">home</span>
                      </NavLink>
                      <NavLink to={CREAR_CUESTIONARIO} className="dropdown-item">
                        <span>Crear cuestionario</span>
                        <span className="material-icons-outlined">home</span>
                      </NavLink>
                      <NavLink to={BANCO_PREGUNTAS} className="dropdown-item">
                        <span>Banco de preguntas</span>
                        <span className="material-icons-outlined">home</span>
                      </NavLink>
                    </ul>
                  </li>
                  <li className="nav-item">
                    <NavLink to={NOTAS} className="nav-link">
                      <span className="material-icons-outlined">grading</span>
                      <span>Notas</span>
                    </NavLink>
                  </li>
                  <li className='nav-item'>
                    <NavLink to="/cuestionariostest/1" className="nav-link">
                      <span className="material-icons-outlined">home</span>
                      <span>Prueba cuestionarios</span>
                    </NavLink>
                  </li>
                </>
              )}
              <li className="nav-item">
                <NavLink to={OFFLINE} className="nav-link">
                  <span className="material-icons-outlined">cloud_off</span>
                  <span>Offline</span>
                </NavLink>
              </li>
            </>
          )}
          <li className="nav-item dropdown">
            <a href="##" className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" data-bs-display="static" aria-expanded="false">
              <span className="material-icons-outlined">account_circle</span>
              <span>{username}</span>
            </a>
            <div className="dropdown-menu dropdown-menu-lg-end" aria-labelledby="navbarDropdownMenuLink" style={{ margin: 0 }}>
              <button type="button" className="dropdown-item" onClick={logout}>
                Cerrar sesión
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </nav>
)




const NavBar = ({ role, username, logout, isOffline }) => (
  <>
    <BottomNavigationBar role={role} username={username} logout={logout} isOffline={isOffline} />
    <NormalNavbar role={role} username={username} logout={logout} isOffline={isOffline} />
  </>
);

export default NavBar;

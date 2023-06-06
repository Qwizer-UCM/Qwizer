import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import { Home,Logout, AdminPanelSettings, WifiOff } from '@mui/icons-material';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { INICIO, OFFLINE, PANEL_LINK } from '../../constants';

const LogoutModal = ({ isShow, setShow, logout }) => {
    const initModal = () => setShow(!isShow);
    return (
        <Modal show={isShow}>
            <Modal.Header closeButton onClick={initModal}>
                <Modal.Title>¿Quieres cerrar sesión?</Modal.Title>
            </Modal.Header>
            <Modal.Footer>
                <Button variant="danger" onClick={initModal}>
                    Cancelar
                </Button>
                <Button variant="dark" onClick={logout}>
                    Cerrar sesión
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
const BottomNavigationBar = ({ isShow, setShow, role, isOffline }) => {
    const [value, setValue] = useState(0);
    return (
        <BottomNavigation sx={{ width: '100%', position: 'absolute', bottom: 0 }} value={value} onChange={(event, newValue) => setValue(newValue)} className="navbar-mobile">
            <BottomNavigationAction component={NavLink} to={INICIO} label="Inicio" icon={<Home />} />

            {role === 'teacher' && !isOffline && <BottomNavigationAction component={NavLink} to={PANEL_LINK} label="Panel" icon={<AdminPanelSettings />} />}

            <BottomNavigationAction component={NavLink} to={OFFLINE} label="Offline" icon={<WifiOff />} />

            <BottomNavigationAction component={NavLink} onClick={() => setShow(!isShow)} label="Cuenta  " icon={<Logout />} />
        </BottomNavigation>
    );
};

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
                                <li className="nav-item">
                                    <NavLink to={PANEL_LINK} className="nav-link">
                                        <span className="material-icons-outlined">grading</span>
                                        <span>Panel</span>
                                    </NavLink>
                                </li>
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
);

const NavBar = ({ role, username, logout, isOffline }) => {
    const [isShow, setShow] = useState(false);
    return (
        <>
            <LogoutModal isShow={isShow} setShow={setShow} logout={logout} />
            <BottomNavigationBar setShow={setShow} role={role} username={username} logout={logout} isOffline={isOffline} />
            <NormalNavbar role={role} username={username} logout={logout} isOffline={isOffline} />
        </>
    );
};

export default NavBar;

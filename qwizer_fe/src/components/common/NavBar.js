import React from "react";
import { Link } from "react-router-dom";

const NavBar = (props) => {
  return (
    <nav className="navbar navbar-expand-lg  bg-light">
      <div className="container-fluid">
        <Link to={"/"} className="nav-link">
          Qwizer
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarText">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <Link to={"/"} className="nav-link active">
                Inicio <span className="sr-only"></span>
              </Link>
            </li>
            {localStorage.getItem("rol") === "teacher" && (
              <li className="nav-item">
                <Link to={"/register"} className="nav-link active">
                  Añadir alumno<span className="sr-only"></span>
                </Link>
              </li>
            )}
            {localStorage.getItem("rol") === "teacher" && (
              <li className="nav-item dropdown ">
                <a href="##" className="nav-link dropdown-toggle active" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Crear cuestionarios
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <Link to={"/upload-questions"} className="dropdown-item">
                      Subir Preguntas<span className="sr-only"></span>
                    </Link>
                  </li>
                  <Link to={"/upload-questionary"} className="dropdown-item">
                    Subir test <span className="sr-only"></span>
                  </Link>
                  <Link to={"/crear-cuestionario"} className="dropdown-item">
                    Crear Cuestionario<span className="sr-only"></span>
                  </Link>
                  <Link to={"/banco-preguntas"} className="dropdown-item">
                    Banco de Preguntas<span className="sr-only"></span>
                  </Link>
                </ul>
              </li>
            )}
            <li className="nav-item active">
              <Link to={"/offline"} className="nav-link active">
                Offline<span className="sr-only"></span>
              </Link>
            </li>
          </ul>
          <span className="">
            <div className="nav-item dropdown">
              <a href="##" className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                {props.username}
              </a>
              <div className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdownMenuLink">
                <button type="button" className="dropdown-item" onClick={props.logout}>
                  Cerrar sesión
                </button>
              </div>
            </div>
          </span>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;

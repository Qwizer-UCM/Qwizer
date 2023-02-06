import { Link } from 'react-router-dom';
import { routes } from '../../constants';

const NotFound404 = () => (
  <div className="d-flex align-items-center justify-content-center h-75">
    <div className="text-center">
      <h1 className="display-1 fw-bold">404</h1>
      <p className="fs-3">
        <span className="text-danger">Oops!</span> Página no encontrada.
      </p>
      <p className="lead">Lo sentimos, no podemos encontrar la página que solicitaste.</p>
      <Link to={routes.INICIO} className="btn btn-primary">
        Ir a pagina de inicio
      </Link>
    </div>
  </div>
);

export default NotFound404;

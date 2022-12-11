import { Navigate, Outlet } from 'react-router-dom';
import NotFound404 from '../components/common/NotFound404';

const ProtectedRoutes = ({ isAllowed, redirectPath, children = undefined }) => {
  if (!isAllowed) return redirectPath ? <Navigate to={redirectPath} replace /> : <NotFound404 />;

  return children ? (
    <>
      {children} <Outlet />
    </>
  ) : (
    <Outlet />
  );
};

export default ProtectedRoutes;

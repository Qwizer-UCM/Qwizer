import { Outlet } from 'react-router-dom';
import NotFound404 from '../components/common/NotFound404';

const ProtectedRoutes = ({ isAllowed, children = undefined }) => {
  if (!isAllowed) return <NotFound404 />;

  return children ? (
    <>
      {children} <Outlet />
    </>
  ) : (
    <Outlet />
  );
};

export default ProtectedRoutes;

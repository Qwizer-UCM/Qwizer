import { Outlet, Navigate } from "react-router-dom";

const ProtectedRoutes = ({ isAllowed, redirectPath = "/login", children=undefined }) => {
  if (!isAllowed) return <Navigate to={redirectPath} replace />;

  return children ? (
    <>
      {children} <Outlet />
    </>
  ) : (
    <Outlet />
  );
};

export default ProtectedRoutes;

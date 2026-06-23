import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";


const AUTH_APP_LOGIN = import.meta.env.VITE_AUTH_LOGIN_URL;

function CheckAuth() {
  const { user, isAuthenticated, appStatus } = useSelector(
    (state) => state.auth
  );

  if (appStatus !== "ready") return null;

  if (!isAuthenticated || !user) {
    window.location.href = AUTH_APP_LOGIN;
    return null;
  }

  return <Outlet />;
}

export default CheckAuth;
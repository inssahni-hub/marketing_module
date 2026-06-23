import MarketingRoutes from "./routes/marketing.route.jsx";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from './assets/happnex-logo.svg'
import {
  fetchAuthMe,
  logoutUser,
} from "./store/auth-slice.js";

import { Layout } from "@company/shared-ui";
import AppSkeleton from "./components/common/AppSkeleton.jsx";

import ActiveRoleSwitch from "./components/common/ActiveRoleSwitch.jsx";
import OrgRoleSwitch from "./components/common/OrgRoleSwitch.jsx";



import MyNotifications from "./components/common/MyNotifications.jsx"; // optional
import SessionExpiredModal from "./components/common/SessionExpiredModal.jsx";

export default function App() {
  const { appStatus, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  
  const websiteUrl = import.meta.env.VITE_AUTH_LOGIN_URL;

  /* ================= AUTH BOOTSTRAP ================= */
  useEffect(() => {
    if (appStatus === "idle") {
      dispatch(fetchAuthMe());
    }
  }, [dispatch, appStatus]);

  /* ================= CROSS MODULE SYNC ================= */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "logout") {
        localStorage.removeItem("auth_user");
        window.location.href = `${websiteUrl}/auth/login`;
      }

      if (e.key === "auth_changed") {
        dispatch(fetchAuthMe());
      }
    };

    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [dispatch, websiteUrl]);

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    try {
      console.log('logout from dashboar module')
      await dispatch(logoutUser()).unwrap();
    } catch (e) {
      console.error("Logout failed", e);
    }

    // 🔥 sync across modules
    localStorage.setItem("logout", Date.now());

    window.location.href = `${websiteUrl}/auth/login`;
  };

  /* ================= LOADING ================= */
  if (appStatus === "idle" || appStatus === "loading") {
    return <AppSkeleton />;
  }

  /* ================= RENDER ================= */
  return (
    <Layout
      user={user}
      onLogout={handleLogout}
      onProfileClick={() => {
        if (user?._id) {
          navigate(`/user/${user._id}`);
        }
      }}
      logo={logo}
      logoLink="/dashboard"
      ActiveRoleSwitch={ActiveRoleSwitch}
      OrgRoleSwitch={OrgRoleSwitch}
      NotificationComponent={MyNotifications} // optional
    >
      <MarketingRoutes />
      <SessionExpiredModal />
    </Layout>
  );
}
import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import axiosReq, {
  processQueue,
} from "@/request/axiosReq";

import {
  closeSessionModal,
  setReAuthLoading,
  setReAuthError,
} from "@/store/sessionSlice";

import { useToast } from "@/components/ui/use-toast";

export default function SessionExpiredModal() {

  const dispatch = useDispatch();

  const { toast } = useToast();

  const [password, setPassword] = useState("");

  const {
    isSessionExpired,
    reAuthLoading,
    reAuthError,
  } = useSelector((state) => state.session);

  const user = useSelector((state) => state.auth.user);

  /* ================= SUBMIT ================= */

  const handleContinue = async () => {

    /* ================= EMPTY VALIDATION ================= */

    if (!password.trim()) {

      dispatch(
        setReAuthError("Password is required")
      );

      return;
    }

    try {

      dispatch(setReAuthLoading(true));

      dispatch(setReAuthError(null));

      await axiosReq.post(
        "/api/auth/re-authenticate",
        {
          email: user.email,
          password,
        }
      );

      /* ================= SUCCESS TOAST ================= */

      toast({
        title: "Session Restored",
        description:
          "You can continue your work safely.",
      });

      /* ================= RETRY QUEUE ================= */

      processQueue();

      /* ================= CLOSE ================= */

      dispatch(closeSessionModal());

      setPassword("");

    } catch (err) {
    
      const message = err.response?.data?.message || "Authentication failed";

      /* ================= INLINE ERROR ================= */

      dispatch(setReAuthError(message));

      /* ================= TOAST ================= */

      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: message,
      });

    } finally {

      dispatch(setReAuthLoading(false));
    }
  };

  /* ================= LOGOUT ================= */

  const handleLogout = () => {

    localStorage.clear();

    window.location.href =
      import.meta.env.VITE_AUTH_LOGIN_URL;
  };

  if (!isSessionExpired) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center">

      <div className="bg-white w-[420px] rounded-2xl p-6">

        <h2 className="text-2xl font-semibold">
          Session Expired
        </h2>

        <p className="text-sm text-gray-500 mt-2">
          Your session expired due to inactivity.
          Please enter password to continue safely.
        </p>

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);

            if (reAuthError) {
              dispatch(setReAuthError(null));
            }
          }}
          className={`w-full border rounded-lg p-3 mt-5 ${
            reAuthError
              ? "border-red-500"
              : "border-gray-300"
          }`}
        />

        {/* ================= INLINE ERROR ================= */}

        {reAuthError && (
          <p className="text-red-500 text-sm mt-2">
            {reAuthError}
          </p>
        )}

        <div className="flex gap-3 mt-6">

          <button
            onClick={handleLogout}
            className="border px-4 py-3 rounded-lg w-full"
          >
            Logout
          </button>

          <button
            disabled={reAuthLoading}
            onClick={handleContinue}
            className="bg-black text-white px-4 py-3 rounded-lg w-full disabled:opacity-50"
          >
            {reAuthLoading
              ? "Please wait..."
              : "Continue"}
          </button>

        </div>

      </div>
    </div>
  );
}
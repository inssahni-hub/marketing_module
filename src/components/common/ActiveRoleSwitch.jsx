import { useState, useMemo } from "react";
import axiosReq from "@/request/axiosReq";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw } from "lucide-react";
import { useDispatch } from "react-redux";
import { fetchAuthMe} from "@/store/auth-slice.js";

const NORMAL_KEY = "NORMAL_USER";

export default function ActiveRoleSwitch({ user }) {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  if (!user || !user.activeRole) return null;

  /* ================= RESOLVE ROLE CONTEXT ================= */

  const roles = useMemo(() => {
    // 🟢 ORGANIZATION CONTEXT
    if (user.activeOrganization && user.organizations?.length) {
      const org = user.organizations.find(
        (o) => o._id === user.activeOrganization._id
      );
      return org?.roles || [];
    }

    // 🔵 GLOBAL CONTEXT
    return user.globalRoles || [];
  }, [user]);

  if (!roles.length) return null;

  /* ================= ROLE CHECKS ================= */

  const normalRole = roles.find((r) => r.key === NORMAL_KEY);
  const activeRole = user.activeRole;

  // ❌ Do not show switch if NORMAL_USER doesn't exist
  if (!normalRole) return null;

  const isNormalActive = activeRole.key === NORMAL_KEY;

  const targetRole = isNormalActive
    ? roles.find((r) => r.key !== NORMAL_KEY) // switch to organizer/admin
    : normalRole; // switch back to buyer

  if (!targetRole) return null;

  const buttonLabel = isNormalActive
    ? "Create Your Own Event"
    : "Your Tickets";

  /* ================= SWITCH ROLE ================= */


const switchRole = async () => {
  setLoading(true);

  try {
    await axiosReq.put("/api/auth/switch-role", {
      roleId: targetRole._id,
      organizationId: user.activeOrganization?._id || null,
    });
     localStorage.removeItem("auth_user");

    // 🔥 IMPORTANT: fetch fresh user into Redux
    await dispatch(fetchAuthMe());

    // 🔄 sync other tabs/modules
    localStorage.setItem("auth_changed", Date.now());

  } catch (err) {
    console.error("Switch role failed", err);
    alert(err.response?.data?.message || "Failed to switch role");
  } finally {
    setLoading(false);
  }
};

  /* ================= UI ================= */

  return (
    <>
      {/* 🔥 FULL SCREEN LOADER */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex flex-col items-center gap-3 text-white">
            <Loader2 className="h-10 w-10 animate-spin" />
            <p className="text-sm">Switching role…</p>
          </div>
        </div>
      )}

      <Button
        variant="outline"
        onClick={switchRole}
        className="flex gap-2"
      >
        <RefreshCcw size={14} />
        {buttonLabel}
      </Button>
    </>
  );
}
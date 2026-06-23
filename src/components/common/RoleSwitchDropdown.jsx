import { useDispatch, useSelector } from "react-redux";
import axiosReq from "@/request/axiosReq";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { BadgeCheck, RefreshCcw } from "lucide-react";
import { setAuthUser } from "@/store/auth-slice";

export default function RoleSwitchDropdown() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  console.log(user)

  if (!user?.activeOrganization || !user?.roles?.length) return null;

  const { activeOrganization, roles, activeRole } = user;

  if (roles.length <= 1) return null;

  const switchRole = async (roleId) => {
    try {
      const res = await axiosReq.post("/api/auth/switch-role", {
        organizationId: activeOrganization._id,
        roleId,
      });

      dispatch(
        setAuthUser({
          activeRole: res.data.activeRole,
          permissions: res.data.permissions,
        })
      );

      window.location.reload(); // ✅ safest
    } catch (err) {
      alert(err.response?.data?.message || "Failed to switch role");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 px-2 py-1 text-xs border rounded-md bg-muted hover:bg-muted/80">
          <RefreshCcw className="h-3 w-3" />
          Switch Role
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          Roles · {activeOrganization.name}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {roles.map((role) => {
          const isActive = role._id === activeRole?._id;

          return (
            <DropdownMenuItem
              key={role._id}
              disabled={isActive}
              onClick={() => switchRole(role._id)}
              className="flex justify-between"
            >
              <span>{role.name}</span>
              {isActive && (
                <BadgeCheck className="h-4 w-4 text-green-600" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

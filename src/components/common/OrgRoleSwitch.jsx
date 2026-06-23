import { useDispatch, useSelector } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { RefreshCcw, BadgeCheck, Building2, UserCog } from "lucide-react";
import {
  switchOrganization,
  switchRole,
  fetchAuthMe,
} from "@/store/auth-slice";

export default function OrgRoleSwitch() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  if (!user || !user.organizations?.length) return null;

  /* ================= ACTIVE ORG CONTEXT ================= */
  const activeOrgContext = user.organizations.find(
    (o) => o._id === user.activeOrganization
  );

  const orgs = user.organizations;
  const roles = activeOrgContext?.roles || [];

  const hasMultipleOrgs = orgs.length > 1;
  const hasMultipleRoles = roles.length > 1;

  if (!hasMultipleOrgs && !hasMultipleRoles) return null;

  /* ================= SWITCH ORGANIZATION ================= */
  const onSwitchOrganization = async (orgId) => {
    await dispatch(switchOrganization(orgId));
    dispatch(fetchAuthMe());
  };

  /* ================= SWITCH ROLE ================= */
  const onSwitchRole = async (roleId) => {
    await dispatch(switchRole(roleId));
    dispatch(fetchAuthMe());
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md bg-muted hover:bg-muted/80">
          <RefreshCcw className="h-4 w-4" />
          Switch Org
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">

        {/* ================= ORGANIZATIONS ================= */}
        {hasMultipleOrgs && (
          <>
            <DropdownMenuLabel className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Organizations
            </DropdownMenuLabel>

            {orgs.map((orgCtx) => {
              const isActive =
                orgCtx._id === user?.activeOrganization?._id;

              return (
                <DropdownMenuItem
                  key={orgCtx._id}
                  disabled={isActive}
                  onClick={() =>
                    onSwitchOrganization(orgCtx._id)
                  }
                  className="flex justify-between"
                >
                  <span>{orgCtx.name}</span>
                  {isActive && (
                    <BadgeCheck className="h-4 w-4 text-green-600" />
                  )}
                </DropdownMenuItem>
              );
            })}

            <DropdownMenuSeparator />
          </>
        )}

        {/* ================= ROLES (ACTIVE ORG ONLY) ================= */}
        {hasMultipleRoles && (
          <>
            <DropdownMenuLabel className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              Roles
            </DropdownMenuLabel>

            {roles.map((role) => {
              const isActive =
                role._id === user.activeRole?._id;

              return (
                <DropdownMenuItem
                  key={role._id}
                  disabled={isActive}
                  onClick={() => onSwitchRole(role._id)}
                  className="flex justify-between"
                >
                  <span>{role.name}</span>
                  {isActive && (
                    <BadgeCheck className="h-4 w-4 text-green-600" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

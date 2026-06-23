export const filterMenuByPermissions = (menus, userPermissions = []) => {
  if (!Array.isArray(userPermissions) || userPermissions.length === 0) {
    return [];
  }

  return menus
    .map((menu) => {
      const menuAllowed = hasPermission(menu.permissions, userPermissions);

      let filteredSubmenus = [];

      if (menu.submenus) {
        filteredSubmenus = menu.submenus.filter((sub) =>
          hasPermission(sub.permissions, userPermissions)
        );
      }

      // show menu if:
      // 1. menu itself allowed
      // 2. OR at least one submenu allowed
      if (menuAllowed || filteredSubmenus.length > 0) {
        return {
          ...menu,
          submenus: filteredSubmenus,
        };
      }

      return null;
    })
    .filter(Boolean);
};

/* ---------------- HELPER ---------------- */

const hasPermission = (required = [], userPermissions = []) => {
  if (!required.length) return true;

  return required.some((req) =>
    userPermissions.some(
      (userPerm) =>
        userPerm === req ||
        userPerm.startsWith(req.split(".")[0]) // 🔥 KEY FIX
    )
  );
};

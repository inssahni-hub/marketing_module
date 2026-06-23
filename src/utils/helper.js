export const capitalize = (text = "") => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Truncate long text
export const truncate = (text = "", length = 18) => {
  if (!text) return "";
  return text.length > length ? `${text.slice(0, length)}…` : text;
};

export const filterMenuByRole = (menu, role) => {
  return menu
    .filter((item) => item.roles?.includes(role))
    .map((item) => ({
      ...item,
      submenus: item.submenus
        ? item.submenus.filter((sub) =>
            sub.roles?.includes(role)
          )
        : [],
    }))
    .filter(
      (item) =>
        !item.submenus ||
        item.submenus.length > 0 ||
        item.path
    );
};

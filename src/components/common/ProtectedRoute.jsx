import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ permissions = [], children }) {
  const { user } = useSelector((state) => state.auth);

  if (!permissions.length) return children;

  const userPermissions = user?.permissions || [];

  const hasPermission = permissions.some((perm) =>
    userPermissions.includes(perm)
  );

  if (!hasPermission) {
    return <Navigate to="/unauth-page" replace />;
  }

  return children;
}
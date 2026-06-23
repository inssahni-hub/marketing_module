import React from "react";

export const AlertDialog = ({
  open,
  children,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {children}
    </div>
  );
};

export const AlertDialogContent = ({
  children,
}) => {
  return (
    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
      {children}
    </div>
  );
};

export const AlertDialogHeader = ({
  children,
}) => {
  return (
    <div className="mb-4">
      {children}
    </div>
  );
};

export const AlertDialogTitle = ({
  children,
}) => {
  return (
    <h2 className="text-lg font-semibold">
      {children}
    </h2>
  );
};

export const AlertDialogDescription = ({
  children,
}) => {
  return (
    <p className="mt-2 text-sm text-gray-600">
      {children}
    </p>
  );
};

export const AlertDialogFooter = ({
  children,
}) => {
  return (
    <div className="mt-6 flex justify-end gap-2">
      {children}
    </div>
  );
};

export const AlertDialogCancel = ({
  children,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="rounded-md border px-4 py-2 text-sm hover:bg-gray-100"
    >
      {children}
    </button>
  );
};

export const AlertDialogAction = ({
  children,
  onClick,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-4 py-2 text-sm text-white ${className}`}
    >
      {children}
    </button>
  );
};
// src/components/ui/Modal.jsx
import React from "react";

const  Modal =({ open, onClose, title, children, size = "md" }) => {
  if (!open) return null;

  // Size classes
  const sizeClass = {
    sm: "w-[300px]",
    md: "w-[500px]",
    lg: "w-[700px]",
  }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={`bg-white rounded-2xl shadow-lg p-6 relative ${sizeClass}`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-900"
        >
          ✕
        </button>

        {/* Modal Title */}
        {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}

        {/* Modal Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}
export { Modal }
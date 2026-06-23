// src/shared/components/AppSkeleton.jsx
import React from "react";

export default function AppSkeleton() {
  return (
    <div className="flex h-screen w-full">
      {/* Sidebar skeleton */}
      <div className="w-64 bg-gray-200 animate-pulse"></div>

      {/* Main content */}
      <div className="flex-1 p-6 space-y-6">
        <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse"></div>

        <div className="grid grid-cols-3 gap-6">
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
}
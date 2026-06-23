import { SearchX } from "lucide-react";

export default function EmptyState({
  title = "No data found",
  description = "Try adjusting your filters or add new data.",
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <SearchX className="h-12 w-12 text-gray-400 mb-4" />

      <h3 className="text-lg font-semibold text-gray-700">
        {title}
      </h3>

      <p className="text-sm text-gray-500 mt-1 max-w-sm">
        {description}
      </p>

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

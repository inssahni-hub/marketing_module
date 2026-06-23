const SkeletonCell = ({ width = "w-full" }) => (
  <div className={`h-4 bg-gray-200 rounded animate-pulse ${width}`} />
);

const TableSkeleton = ({
  columns = [],
  rows = 5,
  showActions = true,
}) => {
  return (
    <div className="bg-white rounded-xl border shadow overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                className={`p-3 text-left ${col.align === "right" ? "text-right" : ""}`}
              >
                {col.label}
              </th>
            ))}
            {showActions && (
              <th className="p-3 text-right">Actions</th>
            )}
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx} className="border-t">
              {columns.map(col => (
                <td key={col.key} className="p-3">
                  <SkeletonCell width={col.width || "w-full"} />
                </td>
              ))}
              {showActions && (
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-2">
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableSkeleton;

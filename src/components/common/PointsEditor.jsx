import { X, Plus } from "lucide-react";

export default function PointsEditor({ points = [], onChange }) {
  const addPoint = () => onChange([...(points || []), ""]);

  const updatePoint = (index, value) => {
    const updated = [...points];
    updated[index] = value;
    onChange(updated);
  };

  const removePoint = (index) => {
    const updated = points.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-1.5">
      {points.map((p, i) => (
        <div key={i} className="flex items-center gap-2 group">
          {/* Bullet */}
          <span className="text-gray-400 text-xs">•</span>

          {/* Input */}
          <input
            value={p}
            placeholder="Point"
            onChange={(e) => updatePoint(i, e.target.value)}
            className="flex-1 bg-transparent border-b text-sm focus:outline-none py-1"
          />

          {/* Remove */}
          <button
            type="button"
            onClick={() => removePoint(i)}
            className="opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-red-500"
          >
            <X size={14} />
          </button>
        </div>
      ))}

      {/* Add Button */}
      <button
        type="button"
        onClick={addPoint}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 mt-1"
      >
        <Plus size={14} /> Add point
      </button>
    </div>
  );
}
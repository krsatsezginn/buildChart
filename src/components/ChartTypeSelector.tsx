import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface ChartTypeSelectorProps {
  hiddenSeries: Set<string>;
  headers: string[];
  colors: string[];
  onToggleSeries: (series: string) => void;
}

export const ChartTypeSelector: React.FC<ChartTypeSelectorProps> = ({
  hiddenSeries,
  headers,
  colors,
  onToggleSeries,
}) => {
  return (
    <div className="flex gap-2">
      {headers.slice(1).map((header, index) => (
        <button
          key={header}
          onClick={() => onToggleSeries(header)}
          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
            hiddenSeries.has(header)
              ? 'bg-slate-100 text-slate-500'
              : 'bg-white text-slate-700 border border-slate-200'
          }`}
          style={{
            borderColor: !hiddenSeries.has(header) ? colors[index % colors.length] : undefined,
            borderWidth: !hiddenSeries.has(header) ? '2px' : '1px'
          }}
        >
          {hiddenSeries.has(header) ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
          <span>{header}</span>
        </button>
      ))}
    </div>
  );
};
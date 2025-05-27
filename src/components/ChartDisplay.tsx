import React, { useState, useRef, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  TooltipProps,
  ReferenceDot,
} from 'recharts';

interface ChartDisplayProps {
  data: Record<string, any>[];
  headers: string[];
  chartType: 'line';
  hiddenSeries: Set<string>;
  colors: string[];
}

interface CustomTooltipProps extends TooltipProps<any, any> {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
      <p className="font-medium text-slate-800 mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={`tooltip-${index}`} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString('tr-TR') : entry.value}
        </p>
      ))}
    </div>
  );
};

export const ChartDisplay: React.FC<ChartDisplayProps> = ({
  data,
  headers,
  hiddenSeries,
  colors,
}) => {
  const [visibleRange, setVisibleRange] = useState<[number, number]>([0, data.length - 1]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleRange([0, data.length - 1]);
  }, [data.length]);

  if (!data.length || !headers.length) {
    return (
      <div className="h-96 flex items-center justify-center bg-white rounded-lg border border-slate-200">
        <p className="text-slate-500">Gösterilecek veri yok</p>
      </div>
    );
  }

  const visibleData = data.slice(visibleRange[0], visibleRange[1] + 1);

  useEffect(() => {
    const chartContainer = chartContainerRef.current;
    if (!chartContainer) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const currentRange = visibleRange[1] - visibleRange[0];
      const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
      const newRange = Math.max(10, Math.min(data.length, Math.round(currentRange * zoomFactor)));
      
      const mouseX = e.offsetX / chartContainer.clientWidth;
      const centerIndex = visibleRange[0] + Math.round(currentRange * mouseX);
      
      let start = Math.round(centerIndex - (newRange * mouseX));
      let end = start + newRange;
      
      if (start < 0) {
        start = 0;
        end = Math.min(data.length, newRange);
      }
      
      if (end > data.length) {
        end = data.length;
        start = Math.max(0, end - newRange);
      }
      
      setVisibleRange([start, end]);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        setIsDragging(true);
        setDragStart(e.offsetX);
        e.preventDefault();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || dragStart === null) return;
      
      const currentRange = visibleRange[1] - visibleRange[0];
      const containerWidth = chartContainer.clientWidth;
      const dragDistance = e.offsetX - dragStart;
      const dragRatio = dragDistance / containerWidth;
      const indexShift = Math.round(dragRatio * currentRange);
      
      let newStart = visibleRange[0] - indexShift;
      let newEnd = visibleRange[1] - indexShift;
      
      if (newStart < 0) {
        newStart = 0;
        newEnd = Math.min(data.length, currentRange);
      }
      if (newEnd > data.length) {
        newEnd = data.length;
        newStart = Math.max(0, data.length - currentRange);
      }
      
      setVisibleRange([newStart, newEnd]);
      setDragStart(e.offsetX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragStart(null);
    };

    const handleMouseLeave = () => {
      setIsDragging(false);
      setDragStart(null);
    };

    chartContainer.addEventListener('wheel', handleWheel, { passive: false });
    chartContainer.addEventListener('mousedown', handleMouseDown);
    chartContainer.addEventListener('mousemove', handleMouseMove);
    chartContainer.addEventListener('mouseup', handleMouseUp);
    chartContainer.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      chartContainer.removeEventListener('wheel', handleWheel);
      chartContainer.removeEventListener('mousedown', handleMouseDown);
      chartContainer.removeEventListener('mousemove', handleMouseMove);
      chartContainer.removeEventListener('mouseup', handleMouseUp);
      chartContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [data.length, visibleRange, isDragging, dragStart]);

  const resetZoom = () => {
    setVisibleRange([0, data.length - 1]);
  };

  const isZoomed = visibleRange[0] !== 0 || visibleRange[1] !== data.length - 1;

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-slate-600">
          Görüntülenen: {visibleRange[0] + 1} - {visibleRange[1] + 1} / {data.length} veri
        </div>
        <div className="flex gap-2 items-center">
          {isZoomed && (
            <button
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              onClick={resetZoom}
            >
              Tümünü Göster
            </button>
          )}
          <div className="text-xs text-slate-500">
            🖱️ Mouse tekerleği: Yakınlaştır/Uzaklaştır | Sol tık + sürükle: Kaydır
          </div>
        </div>
      </div>
      <div 
        ref={chartContainerRef}
        className="h-96"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={visibleData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={headers[0]}
              interval="preserveStartEnd"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            {/* Ana veri çizgisi */}
            {!hiddenSeries.has(headers[1]) && (
              <Line
                type="monotone"
                dataKey={headers[1]}
                stroke={colors[0]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
                connectNulls
              />
            )}
            {/* Her zaman görünür olması gereken ana veri çizgisi */}
            <Line
              type="monotone"
              dataKey={headers[1]}
              stroke="transparent"
              dot={false}
              activeDot={false}
              connectNulls
            />
            {/* Sinyal noktaları */}
            {headers.slice(2).map((header, index) => {
              if (hiddenSeries.has(header)) return null;
              
              return visibleData
                .filter(item => item[header] !== null && item[header] !== undefined && item[header] !== 0)
                .map((item, pointIndex) => (
                  <ReferenceDot
                    key={`signal-${header}-${pointIndex}`}
                    x={item[headers[0]]}
                    y={item[headers[1]]}
                    r={6}
                    fill={colors[(index + 1) % colors.length]}
                    stroke="white"
                    strokeWidth={2}
                  />
                ));
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
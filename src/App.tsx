import React, { useState } from 'react';
import { Dropzone } from './components/Dropzone';
import { ChartDisplay } from './components/ChartDisplay';
import { Header } from './components/Header';
import { useExcelData } from './hooks/useExcelData';
import { ChartTypeSelector } from './components/ChartTypeSelector';
import { Plus } from 'lucide-react';

const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#6366F1', // Indigo
];

interface ChartData {
  id: string;
  data: Record<string, any>[];
  headers: string[];
  hiddenSeries: Set<string>;
}

function App() {
  const [charts, setCharts] = useState<ChartData[]>([]);
  const { 
    data, 
    headers, 
    isLoading, 
    error, 
    handleFileUpload,
    resetData,
    setData 
  } = useExcelData();
  const [currentHiddenSeries, setCurrentHiddenSeries] = useState<Set<string>>(new Set());

  const handleAddChart = () => {
    if (data && headers.length > 0) {
      setCharts([...charts, {
        id: crypto.randomUUID(),
        data,
        headers,
        hiddenSeries: new Set(currentHiddenSeries)
      }]);
      setData(null);
      setCurrentHiddenSeries(new Set());
    }
  };

  const handleToggleSeries = (id: string | null, series: string) => {
    if (id === null) {
      const newHiddenSeries = new Set(currentHiddenSeries);
      if (newHiddenSeries.has(series)) {
        newHiddenSeries.delete(series);
      } else {
        newHiddenSeries.add(series);
      }
      setCurrentHiddenSeries(newHiddenSeries);
    } else {
      setCharts(charts.map(chart => {
        if (chart.id === id) {
          const newHiddenSeries = new Set(chart.hiddenSeries);
          if (newHiddenSeries.has(series)) {
            newHiddenSeries.delete(series);
          } else {
            newHiddenSeries.add(series);
          }
          return { ...chart, hiddenSeries: newHiddenSeries };
        }
        return chart;
      }));
    }
  };

  const handleRemoveChart = (id: string) => {
    setCharts(charts.filter(chart => chart.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col gap-8">
        {charts.map((chart) => (
          <div key={chart.id} className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold text-slate-800">
                Grafik
              </h2>
              <div className="flex items-center gap-4">
                <ChartTypeSelector 
                  headers={chart.headers}
                  hiddenSeries={chart.hiddenSeries}
                  colors={COLORS}
                  onToggleSeries={(series) => handleToggleSeries(chart.id, series)}
                />
                <button
                  onClick={() => handleRemoveChart(chart.id)}
                  className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Grafiği Kaldır
                </button>
              </div>
            </div>
            <ChartDisplay 
              data={chart.data} 
              headers={chart.headers} 
              chartType="line"
              hiddenSeries={chart.hiddenSeries}
              colors={COLORS}
            />
          </div>
        ))}

        {!data ? (
          <Dropzone onFileUpload={handleFileUpload} isLoading={isLoading} error={error} />
        ) : (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold text-slate-800">
                Yeni Grafik
              </h2>
              <ChartTypeSelector 
                headers={headers}
                hiddenSeries={currentHiddenSeries}
                colors={COLORS}
                onToggleSeries={(series) => handleToggleSeries(null, series)}
              />
            </div>
            <ChartDisplay 
              data={data} 
              headers={headers} 
              chartType="line"
              hiddenSeries={currentHiddenSeries}
              colors={COLORS}
            />
            <div className="flex justify-center">
              <button
                onClick={handleAddChart}
                className="px-6 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Grafiği Ekle
              </button>
            </div>
          </div>
        )}

        {charts.length > 0 && !data && (
          <button
            onClick={() => setData(null)}
            className="flex items-center justify-center gap-2 px-6 py-3 mx-auto text-sm bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Yeni Grafik Ekle
          </button>
        )}
      </main>
      <footer className="py-6 bg-white border-t border-slate-200">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} Excel Chart Visualizer. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;
import React from 'react';
import { BarChart } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 py-4 px-4 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart className="h-6 w-6 text-blue-500" />
          <h1 className="text-xl font-semibold text-slate-800">Excel Chart Visualizer</h1>
        </div>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          Github
        </a>
      </div>
    </header>
  );
};
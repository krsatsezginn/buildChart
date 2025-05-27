import React, { useCallback, useState } from 'react';
import { FileSpreadsheet, Upload, AlertCircle, Loader2 } from 'lucide-react';

interface DropzoneProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFileUpload, isLoading, error }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        onFileUpload(file);
      }
    },
    [onFileUpload]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        onFileUpload(file);
      }
    },
    [onFileUpload]
  );

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md mx-auto mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">
          Excel Verilerinizi Görselleştirin
        </h1>
        <p className="text-slate-600">
          Excel dosyanızı yükleyerek otomatik olarak güzel, interaktif grafikler oluşturun. 
          Dosyanızı sürükleyip bırakın veya tıklayarak seçin.
        </p>
      </div>

      <div
        className={`w-full max-w-md h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-6 transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
        } ${isLoading ? 'opacity-75 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isLoading ? (
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Dosyanız işleniyor...</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium mb-2">Dosya işleme hatası</p>
            <p className="text-slate-600 text-sm">{error}</p>
            <button
              onClick={() => onFileUpload(new File([], ''))}
              className="mt-4 px-4 py-2 bg-slate-200 rounded-lg text-slate-700 hover:bg-slate-300 transition-colors"
            >
              Tekrar Deneyin
            </button>
          </div>
        ) : (
          <>
            <FileSpreadsheet className="h-12 w-12 text-blue-500 mb-4" />
            <p className="text-slate-700 font-medium mb-2">
              Excel dosyanızı buraya sürükleyin
            </p>
            <p className="text-slate-500 text-sm mb-4">
              veya dosya seçmek için tıklayın
            </p>
            <label className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
              />
              <Upload className="h-4 w-4 inline mr-2" />
              Dosya Seç
            </label>
          </>
        )}
      </div>

      <div className="mt-8 text-center text-slate-500 text-sm">
        <p>Desteklenen dosya formatları: .xlsx, .xls, .csv</p>
      </div>
    </div>
  );
};
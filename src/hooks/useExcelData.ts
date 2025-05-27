import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { ChartType } from '../types';

const formatDate = (value: any): string => {
  try {
    if (value instanceof Date) {
      // Handle both date and datetime
      const hasTime = value.getHours() !== 0 || value.getMinutes() !== 0 || value.getSeconds() !== 0;
      if (hasTime) {
        return value.toLocaleString('tr-TR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      return value.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
    
    if (typeof value === 'number' && value > 1 && value < 47483) {
      const date = new Date((value - (25567 + 2)) * 86400 * 1000);
      if (!isNaN(date.getTime())) {
        const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0 || date.getSeconds() !== 0;
        if (hasTime) {
          return date.toLocaleString('tr-TR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
        return date.toLocaleDateString('tr-TR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      }
    }
    
    if (typeof value === 'string') {
      const parsedDate = new Date(value);
      if (!isNaN(parsedDate.getTime())) {
        const hasTime = parsedDate.getHours() !== 0 || parsedDate.getMinutes() !== 0 || parsedDate.getSeconds() !== 0;
        if (hasTime) {
          return parsedDate.toLocaleString('tr-TR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
        return parsedDate.toLocaleDateString('tr-TR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      }
    }
    
    return String(value);
  } catch (error) {
    return String(value);
  }
};

export const useExcelData = () => {
  const [data, setData] = useState<Record<string, any>[] | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<ChartType>('line');
  const [rowCount, setRowCount] = useState<number>(0);

  const resetData = useCallback(() => {
    setData(null);
    setHeaders([]);
    setError(null);
    setRowCount(0);
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.size) {
      resetData();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fileType = file.name.split('.').pop()?.toLowerCase();
      if (!['xlsx', 'xls', 'csv'].includes(fileType || '')) {
        throw new Error('Desteklenmeyen dosya formatı. Lütfen Excel veya CSV dosyası yükleyin.');
      }

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      
      const rawData = XLSX.utils.sheet_to_json<any[]>(worksheet, { 
        header: 1,
        raw: true
      });
      
      if (rawData.length < 2) {
        throw new Error('Dosya yetersiz veri içeriyor. Lütfen en az bir başlık satırı ve bir veri satırı içeren bir dosya yükleyin.');
      }

      const headerRow = rawData[0] as string[];
      const extractedHeaders = headerRow.map(header => String(header || ''));
      
      const dataRows = rawData.slice(1).filter(row => 
        row.some((cell: any) => cell !== undefined && cell !== '')
      );

      if (dataRows.length === 0) {
        throw new Error('Dosyada geçerli veri satırı bulunamadı.');
      }

      setRowCount(dataRows.length);

      const formattedData = dataRows.map(row => {
        const formattedRow: Record<string, any> = {};
        row.forEach((value: any, index: number) => {
          const headerName = extractedHeaders[index] || `Sütun ${index + 1}`;
          
          if (index === 0) { // First column (date column)
            formattedRow[headerName] = formatDate(value);
          } else {
            formattedRow[headerName] = value;
          }
        });
        return formattedRow;
      });

      setHeaders(extractedHeaders);
      setData(formattedData);
    } catch (err) {
      console.error('Dosya işleme hatası:', err);
      setError(err instanceof Error ? err.message : 'Dosya işlenirken bilinmeyen bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  }, [resetData]);

  return {
    data,
    headers,
    isLoading,
    error,
    handleFileUpload,
    chartType,
    setChartType,
    resetData,
    rowCount,
    setData
  };
};
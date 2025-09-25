import { useCallback, useState } from 'react';
import { fetchAnalysisData } from '@/lib/api';
import type { AnalysisData } from '@/types/analysis';
import type { FileRiskProfile } from '@/types/risk';

interface UseAnalysisDataResult {
  analysisData: AnalysisData | null;
  setAnalysisData: React.Dispatch<React.SetStateAction<AnalysisData | null>>;
  riskAnalysis: FileRiskProfile[];
  setRiskAnalysis: React.Dispatch<React.SetStateAction<FileRiskProfile[]>>;
  analysisLoadedAt: number | null;
  setAnalysisLoadedAt: React.Dispatch<React.SetStateAction<number | null>>;
  isLoading: boolean;
  loadError: string | null;
  loadAnalysis: () => Promise<AnalysisData | null>;
}

export function useAnalysisData(): UseAnalysisDataResult {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [riskAnalysis, setRiskAnalysis] = useState<FileRiskProfile[]>([]);
  const [analysisLoadedAt, setAnalysisLoadedAt] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadAnalysis = useCallback(async (): Promise<AnalysisData | null> => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const result = (await fetchAnalysisData()) as AnalysisData;
      setAnalysisData(result);
      setRiskAnalysis(result.riskAnalysis || []);
      setAnalysisLoadedAt(Date.now());
      return result;
    } catch (error) {
      console.error('Failed to load analysis data:', error);
      setAnalysisData(null);
      setRiskAnalysis([]);
      setLoadError(error instanceof Error ? error.message : 'Gagal memuat data analisis.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    analysisData,
    setAnalysisData,
    riskAnalysis,
    setRiskAnalysis,
    analysisLoadedAt,
    setAnalysisLoadedAt,
    isLoading,
    loadError,
    loadAnalysis,
  };
}

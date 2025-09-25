import axios from 'axios';

function resolveBaseURL(): string {
  const envBaseURL = import.meta.env.VITE_API_URL?.trim();
  const forceEnv = import.meta.env.VITE_FORCE_API_URL === 'true';

  if (import.meta.env.DEV || forceEnv) {
    return envBaseURL || '';
  }

  if (!envBaseURL) {
    return '';
  }

  // Allow relative paths to continue working when explicitly configured.
  if (envBaseURL.startsWith('/')) {
    return envBaseURL;
  }

  if (typeof window !== 'undefined') {
    try {
      const targetURL = new URL(envBaseURL, window.location.origin);
      if (targetURL.origin === window.location.origin) {
        return targetURL.pathname === '/' ? '' : targetURL.pathname;
      }
    } catch (error) {
      console.warn('Gagal mem-parsing VITE_API_URL, fallback ke origin saat ini:', error);
    }
  }

  return '';
}

export const api = axios.create({
  baseURL: resolveBaseURL(),
});

export async function fetchAnalysisData() {
  const { data } = await api.get('/api/data');
  return data;
}

export async function findDependencyPath(payload: { 
  startNode: string; 
  endNode: string 
}) {
  const { data } = await api.post('/find-path', payload);
  return data.path; // Mengembalikan array jalur atau null
}

export async function findAllDependencyPaths(payload: { 
  startNode: string; 
  endNode: string;
  maxDepth?: number;
}) {
  const { data } = await api.post('/find-all-paths', payload);
  return data.paths; // Mengembalikan array dari semua jalur yang ditemukan
}

export async function simulateRemoval(payload: { fileToRemove: string; dependencyMap?: Record<string, any> }) {
  const { data } = await api.post('/api/simulate-removal', payload);
  return data; // Mengembalikan { brokenFiles, newOrphans }
}

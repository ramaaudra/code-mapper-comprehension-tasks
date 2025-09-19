import axios from 'axios';

export const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000' 
});

export async function analyzeProject(payload: { 
  rootPath: string; 
  include?: string[]; 
  exclude?: string[] 
}) {
  const { data } = await api.post('/analyze', payload); 
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

export async function simulateRemoval(payload: { fileToRemove: string }) {
  const { data } = await api.post('/api/simulate-removal', payload);
  return data; // Mengembalikan { brokenFiles, newOrphans }
}

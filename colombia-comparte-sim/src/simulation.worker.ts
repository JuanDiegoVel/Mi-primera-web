import { runSimulation } from './lib/simulation';

self.onmessage = (e) => {
  const { numUsers, maxSteps } = e.data;
  const BATCH_SIZE = 10000;
  let results: any[] = [];
  
  for (let i = 0; i < numUsers; i += BATCH_SIZE) {
    const batch = Math.min(BATCH_SIZE, numUsers - i);
    const batchResults = runSimulation(batch, maxSteps);
    // Ajustar IDs para que sean continuos
    batchResults.forEach(r => r.usuario += i);
    results = results.concat(batchResults);
  }
  
  self.postMessage(results);
};
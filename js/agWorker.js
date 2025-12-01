// Web Worker to run the genetic algorithm off the main thread
import { ag } from './AG.js';

self.onmessage = (e) => {
  const {
    numGeneraciones,
    tamPoblacion,
    tamCromosoma,
    porcentajeTorneo,
    porcentajeMutacion,
    porcentajeElitismo,
    tablero,
  } = e.data || {};

  try {
    const sol = ag(
      numGeneraciones,
      tamPoblacion,
      tamCromosoma,
      porcentajeTorneo,
      porcentajeMutacion,
      porcentajeElitismo,
      tablero
    );

    self.postMessage({ type: 'result', sol });
  } catch (err) {
    self.postMessage({ type: 'error', message: (err && err.message) || String(err) });
  }
};

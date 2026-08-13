/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type StateType = 'inicial' | 'intermedio' | 'final exitoso' | 'final negativo' | 'error' | 'seguimiento';

export interface StateInfo {
  code: string;
  name: string;
  description: string;
  type: StateType;
}

export const STATES_METADATA: Record<string, StateInfo> = {
  "S0": { code: "S0", name: "Llegada", description: "Llega a colombiacomparte.com", type: "inicial" },
  "S1": { code: "S1", name: "Inicio", description: "Ve página de inicio (hero + banner)", type: "intermedio" },
  "S2": { code: "S2", name: "A quiénes apoyamos", description: "Lee 'A quiénes apoyamos'", type: "seguimiento" },
  "S3": { code: "S3", name: "Historia", description: "Lee 'Nuestra historia'", type: "seguimiento" },
  "S4": { code: "S4", name: "Impacto", description: "Ve sección 'Nuestro impacto'", type: "seguimiento" },
  "S5": { code: "S5", name: "Testimonios", description: "Explora testimonios", type: "seguimiento" },
  "S6": { code: "S6", name: "Sobre nosotros", description: "Entra a 'Sobre nosotros'", type: "intermedio" },
  "S7": { code: "S7", name: "Edifica", description: "Entra a 'Programa Edifica'", type: "intermedio" },
  "S8": { code: "S8", name: "Detalle Edifica", description: "Lee detalle del Programa Edifica", type: "intermedio" },
  "S9": { code: "S9", name: "Top Speakers", description: "Entra a 'Top Speakers'", type: "intermedio" },
  "S10": { code: "S10", name: "Info Speakers", description: "Solicita info de Top Speakers (email)", type: "intermedio" },
  "S11": { code: "S11", name: "Noticias", description: "Entra a sección 'Noticias'", type: "seguimiento" },
  "S12": { code: "S12", name: "Lectura Noticia", description: "Lee una noticia completa", type: "seguimiento" },
  "S13": { code: "S13", name: "Contacto", description: "Entra a 'Contacto'", type: "intermedio" },
  "S14": { code: "S14", name: "Form Contacto", description: "Completa formulario de contacto", type: "intermedio" },
  "S15": { code: "S15", name: "Envío Contacto", description: "Envía formulario de contacto", type: "intermedio" },
  "S16": { code: "S16", name: "Donaciones", description: "Ve sección 'Donaciones'", type: "intermedio" },
  "S17": { code: "S17", name: "Checkout Bold", description: "Clic en botón 'Donar' (Bold checkout)", type: "intermedio" },
  "S18": { code: "S18", name: "Donado", description: "Completa proceso de donación", type: "intermedio" },
  "S19": { code: "S19", name: "Tu Aula", description: "Entra a 'Tu Aula'", type: "intermedio" },
  "S20": { code: "S20", name: "Login Aula", description: "Intenta iniciar sesión en Tu Aula", type: "intermedio" },
  "S21": { code: "S21", name: "Acceso Aula", description: "Accede exitosamente a Tu Aula", type: "intermedio" },
  "S22": { code: "S22", name: "Directorio", description: "Entra a 'Directorio de Emprendedores'", type: "intermedio" },
  "S23": { code: "S23", name: "Perfil Emprendedor", description: "Ve perfil de un emprendedor", type: "intermedio" },
  "S24": { code: "S24", name: "Quiero Emprender", description: "Clic en 'Quiero emprender'", type: "intermedio" },
  "S25": { code: "S25", name: "Form Edifica", description: "Ve formulario de inscripción a Edifica", type: "intermedio" },
  "S26": { code: "S26", name: "Llenado Edifica", description: "Completa formulario de inscripción", type: "intermedio" },
  "S27": { code: "S27", name: "Envío Edifica", description: "Envía formulario de inscripción a Edifica", type: "intermedio" },
  "S28": { code: "S28", name: "RRSS", description: "Sigue redes sociales", type: "intermedio" },
  "S29": { code: "S29", name: "Éxito Total", description: "Inscripción / Donación / Aula exitosa", type: "final exitoso" },
  "S30": { code: "S30", name: "Abandono", description: "Abandona el sitio sin acción", type: "final negativo" },
  "S31": { code: "S31", name: "Fallo", description: "Error técnico o formulario fallido", type: "error" },
};

export const STATE_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(STATES_METADATA).map(([k, v]) => [k, v.description])
);

export const INITIAL_PATHS: string[][] = [
    ["S0","S1","S24","S25","S26","S27","S29"],
    ["S0","S1","S7","S8","S24","S25","S26","S27","S29"],
    ["S0","S1","S2","S7","S8","S24","S25","S26","S27","S29"],
    ["S0","S1","S3","S7","S8","S24","S25","S26","S27","S29"],
    ["S0","S1","S4","S7","S8","S24","S25","S26","S27","S29"],
    ["S0","S1","S5","S7","S8","S24","S25","S26","S27","S29"],
    ["S0","S1","S6","S7","S8","S24","S25","S26","S27","S29"],
    ["S0","S1","S11","S12","S7","S8","S24","S25","S26","S27","S29"],
    ["S0","S1","S22","S23","S7","S8","S24","S25","S26","S27","S29"],
    ["S0","S1","S2","S3","S4","S5","S7","S8","S24","S25","S26","S27","S29"],
    ["S0","S1","S7","S8","S25","S26","S27","S29"],
    ["S0","S1","S5","S6","S7","S8","S24","S25","S26","S27","S29"],
    ["S0","S1","S4","S5","S7","S8","S24","S25","S26","S27","S29"],
    ["S0","S1","S3","S4","S5","S7","S8","S24","S25","S26","S27","S29"],
    ["S0","S1","S30"],
    ["S0","S1","S2","S30"],
    ["S0","S1","S7","S30"],
    ["S0","S1","S7","S8","S30"],
    ["S0","S1","S7","S8","S24","S25","S30"],
    ["S0","S1","S7","S8","S24","S25","S26","S30"],
    ["S0","S1","S2","S7","S8","S30"],
    ["S0","S1","S3","S30"],
    ["S0","S1","S5","S30"],
    ["S0","S1","S4","S30"],
    ["S0","S1","S11","S12","S30"],
    ["S0","S1","S22","S23","S30"],
    ["S0","S1","S16","S17","S18","S29"],
    ["S0","S1","S3","S4","S16","S17","S18","S29"],
    ["S0","S1","S5","S16","S17","S18","S29"],
    ["S0","S1","S6","S16","S17","S18","S29"],
    ["S0","S1","S2","S3","S4","S5","S16","S17","S18","S29"],
    ["S0","S1","S11","S12","S16","S17","S18","S29"],
    ["S0","S1","S16","S30"],
    ["S0","S1","S16","S17","S30"],
    ["S0","S1","S3","S16","S17","S30"],
    ["S0","S1","S19","S20","S21","S29"],
    ["S0","S1","S7","S8","S19","S20","S21","S29"],
    ["S0","S1","S19","S20","S31"],
    ["S0","S1","S19","S30"],
    ["S0","S1","S9","S10","S29"],
    ["S0","S1","S6","S9","S10","S29"],
    ["S0","S1","S9","S30"],
    ["S0","S1","S6","S9","S30"],
    ["S0","S1","S13","S14","S15","S29"],
    ["S0","S1","S6","S13","S14","S15","S29"],
    ["S0","S1","S7","S8","S13","S14","S15","S29"],
    ["S0","S1","S9","S13","S14","S15","S29"],
    ["S0","S1","S13","S14","S30"],
    ["S0","S1","S13","S30"],
    ["S0","S1","S13","S14","S15","S31"],
    ["S0","S1","S28","S29"],
    ["S0","S1","S5","S28","S29"],
    ["S0","S1","S11","S12","S28","S29"],
    ["S0","S1","S22","S23","S24","S25","S26","S27","S29"],
    ["S0","S1","S22","S23","S28","S29"],
    ["S0","S1","S22","S23","S7","S8","S24","S25","S26","S27","S29"],
    ["S0","S1","S7","S8","S24","S25","S26","S27","S31"],
    ["S0","S1","S16","S17","S18","S31"],
    ["S0","S1","S13","S14","S15","S31"],
    ["S0","S1","S2","S3","S4","S5","S6","S7","S8","S24","S25","S26","S27","S29"],
    ["S0","S1","S11","S12","S5","S7","S8","S24","S25","S26","S27","S29"],
    ["S0","S1","S6","S4","S3","S16","S17","S18","S29"],
    ["S0","S1","S22","S23","S5","S16","S17","S18","S29"],
    ["S0","S1","S2","S7","S8","S22","S23","S24","S25","S26","S27","S29"],
];

export interface SimResult {
  usuario: number;
  recorrido: string[];
  estado_final: string;
  resultado: string;
  num_pasos: number;
  categoria: 'Éxito' | 'Abandono' | 'Error';
}

export interface Matrices {
  counts: Record<string, Record<string, number>>;
  probabilities: Record<string, Record<string, number>>;
}

export function buildMatrices(): Matrices {
  const states = Object.keys(STATES_METADATA);
  const counts: Record<string, Record<string, number>> = {};

  states.forEach(s => {
    counts[s] = {};
    states.forEach(s2 => counts[s][s2] = 0);
  });

  INITIAL_PATHS.forEach(path => {
    for (let i = 0; i < path.length - 1; i++) {
      counts[path[i]][path[i + 1]]++;
    }
  });

  const probabilities: Record<string, Record<string, number>> = {};
  states.forEach(s => {
    probabilities[s] = {};
    const sum = Object.values(counts[s]).reduce((a, b) => a + b, 0);
    states.forEach(s2 => {
      probabilities[s][s2] = sum === 0 ? 0 : counts[s][s2] / sum;
    });
  });

  return { counts, probabilities };
}

export function simulateUser(probabilities: Record<string, Record<string, number>>, startState: string = 'S0', maxSteps: number = 40): string[] {
  let currentState = startState;
  const path = [currentState];
  const finalStates = new Set(['S29', 'S30', 'S31']);

  for (let i = 0; i < maxSteps; i++) {
    if (finalStates.has(currentState)) break;

    const transitionProbs = probabilities[currentState];
    const states = Object.keys(transitionProbs);
    const probs = Object.values(transitionProbs);
    const sum = probs.reduce((a, b) => a + b, 0);

    if (sum === 0) break;

    // Proportional selection
    let r = Math.random();
    let cumulative = 0;
    let nextState = currentState;
    for (let j = 0; j < states.length; j++) {
      cumulative += probs[j];
      if (r <= cumulative) {
        nextState = states[j];
        break;
      }
    }
    path.push(nextState);
    currentState = nextState;
  }
  return path;
}

export function runSimulation(count: number = 1000, maxSteps: number = 40): SimResult[] {
  const { probabilities } = buildMatrices();
  const results: SimResult[] = [];

  for (let i = 0; i < count; i++) {
    const path = simulateUser(probabilities, 'S0', maxSteps);
    const finalState = path[path.length - 1];
    
    let categoria: 'Éxito' | 'Abandono' | 'Error' = 'Abandono';
    if (finalState === 'S29') categoria = 'Éxito';
    if (finalState === 'S31') categoria = 'Error';

    results.push({
      usuario: i + 1,
      recorrido: path,
      estado_final: finalState,
      resultado: STATE_NAMES[finalState],
      num_pasos: path.length,
      categoria
    });
  }

  return results;
}

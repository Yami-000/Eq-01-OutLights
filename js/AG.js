import { clickearCasilla } from "./generarTablero.js"

function randomEntero(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function limpiarCromosoma(crom) {
    
    const isValid = (r, c) => Number.isInteger(r) && Number.isInteger(c) && r >= 0 && r < 5 && c >= 0 && c < 5;

    const counts = new Map();
    for (const gen of crom) {
        if (!Array.isArray(gen) || gen.length < 2) continue;
        const [r, c] = gen;
        if (!isValid(r, c)) continue;
        const key = `${r},${c}`;
        counts.set(key, (counts.get(key) || 0) + 1);
    }

    const oddKeys = new Set();
    for (const [k, v] of counts.entries()) {
        if (v % 2 === 1) oddKeys.add(k);
    }

    const usados = new Set();
    const limpio = [];
    for (const gen of crom) {
        if (!Array.isArray(gen) || gen.length < 2) continue;
        const [r, c] = gen;
        if (!isValid(r, c)) continue;
        const key = `${r},${c}`;
        if (oddKeys.has(key) && !usados.has(key)) {
            usados.add(key);
            limpio.push([r, c]);
        }
    }

    return limpio;
}

function calcularFitness(tablero) {
    let luces = 0;
    for (let i = 0; i < 5; i++)
        for (let j = 0; j < 5; j++)
            if (tablero[i][j] === 1) luces++;

    return luces; //+ rep * pesoRepeticion;
}

function crearCromosoma(tam) {
    let crom = [];
    for (let i = 0; i < tam; i++) {
        crom.push([randomEntero(0,4), randomEntero(0,4)]);
    }
    return crom;
}

function actualizarVistaSinReiniciar(tablero) {
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const btn = document.querySelector(`button[data-row="${i}"][data-col="${j}"]`);
      if (!btn) continue;

      if (tablero[i][j] === 1) {
        btn.classList.add("boton-on");
        btn.classList.remove("boton-off");
      } else {
        btn.classList.add("boton-off");
        btn.classList.remove("boton-on");
      }
    }
  }
}


export async function aplicarSecuenciaConAnimacion(tablero, secuencia, delay = 300) {
  let actual = tablero.map(f => [...f]);

  for (const [fila, col] of secuencia) {

    actual = clickearCasilla(fila, col, actual);

    actualizarVistaSinReiniciar(actual);

    await new Promise(res => setTimeout(res, delay));
  }

  return actual;
}

function aplicarCromosoma(tablero, secuencia) {
  let nuevo = tablero.map(f => [...f]);

  for (const [fila, col] of secuencia) {
    nuevo = clickearCasilla(fila, col, nuevo);
  }

  return nuevo;
}

function buscarSolucionEnSubsecuencias(tablero, cromosoma) {
  
  for (let fin = 1; fin < cromosoma.length; fin++) {
    const subsecuencia = cromosoma.slice(0, fin);
    const tableroResultante = aplicarCromosoma(tablero, subsecuencia);
    const fitness = calcularFitness(tableroResultante);
    
    if (fitness === 0) {
      return subsecuencia;
    }
  }
  
  return null;
}

function crearPoblacion(n, tam, tablero) {
    let pob = [];
    for (let i = 0; i < n; i++) {
        const crom = crearCromosoma(tam);
        const tabPost = aplicarCromosoma(tablero, crom);
        const fit = calcularFitness(tabPost);
        pob.push([crom, fit]);
    }
    return pob;
}

function rdSample(arr, n) {
    const copy = arr.map(i => [i[0], i[1]]);
    const sample = [];
    for (let i = 0; i < n && copy.length > 0; i++) {
        const idx = Math.floor(Math.random()*copy.length);
        sample.push(copy.splice(idx,1)[0]);
    }
    return sample;
}

function buscarMejoresElitismo(poblacion, porcentaje) {
    const orden = poblacion.map(i => [i[0], i[1]])

    .sort((a,b)=> {
       if (a[1] === b[1]) return randomEntero(0,1) ? 1 : -1;
       return a[1] - b[1];
    });

    const cant = Math.round(orden.length * (porcentaje/100));
    const elites = [];
    const vistos = new Set();

    for (const [crom, fit] of orden) {
        const key = JSON.stringify(crom);
        if (!vistos.has(key)) {
            vistos.add(key);
            elites.push([crom, fit]);
            if (elites.length === cant) break;
        }
    }

    return elites;
}

function seleccionProgenitores(tamPoblacion, poblacion, porcentajeTorneo, porcentajeElitismo) {

    const n = Math.round(poblacion.length * (porcentajeTorneo / 100));
    const elites = Math.round(poblacion.length * (porcentajeElitismo / 100));
    const parejas = tamPoblacion - elites;
    const pool = [];

    for (let i = 0; i < parejas; i++) {
        const torneo1 = rdSample(poblacion, n);
        const padre1 = torneo1.reduce((b, f) => f[1] < b[1] ? f : b);

        const torneo2 = rdSample(poblacion, n);
        const padre2 = torneo2.reduce((b, f) => f[1] < b[1] ? f : b);

        pool.push([padre1[0], padre2[0]]);
    }

    return pool;
}

function mutacion(crom, porcentaje) {
    let nuevo = crom.map(g => [...g]);
    for (let i = 0; i < nuevo.length; i++) {
        if (randomEntero(1, 100) <= porcentaje) {
            nuevo[i] = [randomEntero(0, 4), randomEntero(0, 4)];
        }
    }
    return nuevo;
}

function cruzamiento(progenitores, tablero, porcentajeMutacion) {
    let hijosElegidos = [];

    for (const [padre1, padre2] of progenitores) {
        const largo = padre1.length;
        const corte = randomEntero(1, largo-1);

        const hijo1 = padre1.slice(0, corte).concat(padre2.slice(corte));
        const hijo2 = padre2.slice(0, corte).concat(padre1.slice(corte));

        const hijo1Cromosoma = mutacion(hijo1, porcentajeMutacion);
        const hijo2Cromosoma = mutacion(hijo2, porcentajeMutacion);

        const subsol1 = buscarSolucionEnSubsecuencias(tablero, hijo1Cromosoma);
        if (subsol1) {
            hijosElegidos.push([subsol1, 0]);
            continue;
        }

        const subsol2 = buscarSolucionEnSubsecuencias(tablero, hijo2Cromosoma);
        if (subsol2) {
            hijosElegidos.push([subsol2, 0]);
            continue;
        }

        const tablero1 = aplicarCromosoma(tablero, hijo1Cromosoma);
        const tablero2 = aplicarCromosoma(tablero, hijo2Cromosoma);

        const fitness1 = calcularFitness(tablero1);
        const fitness2 = calcularFitness(tablero2);

        if (fitness1 <= fitness2)
            hijosElegidos.push([hijo1Cromosoma, fitness1]);
        else
            hijosElegidos.push([hijo2Cromosoma, fitness2]);
    }

    return hijosElegidos;
}

export function ag(
  numGeneraciones,
  tamPoblacion,
  tamCromosoma,
  porcentajeTorneo,
  porcentajeMutacion,
  porcentajeElitismo,
  tablero
) {
    let poblacion = crearPoblacion(tamPoblacion, tamCromosoma, tablero);

    for (let gen = 0; gen < numGeneraciones; gen++) {
        const nuevaGen = [];

        const elites = buscarMejoresElitismo(poblacion, porcentajeElitismo);
        for (const e of elites) nuevaGen.push(e);

        const padres = seleccionProgenitores(tamPoblacion, poblacion, porcentajeTorneo, porcentajeElitismo);
        const hijos = cruzamiento(padres, tablero, porcentajeMutacion);

        for (const h of hijos) nuevaGen.push(h);

        const solucion = nuevaGen.find(i => i[1] === 0);
        if (solucion) {
            console.log(`Solución encontrada en generación ${gen}`);
            return solucion;
        }

        const avgFit = poblacion.reduce((s, i) => s + i[1], 0) / poblacion.length;

        poblacion = nuevaGen;
    }

    return null;
}



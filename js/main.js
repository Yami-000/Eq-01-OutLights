import { generarVistaTablero, generarTablero, clickearCasilla } from "./generarTablero.js";
import { ag, aplicarSecuenciaConAnimacion } from "./AG.js";

let tableroBase = null;
let tableroActual = null;

function initGame() {
  tableroBase = generarTablero();
  tableroActual = tableroBase.map(f => [...f]);
  generarVistaTablero(tableroActual, manejarClick);
  const lista = document.getElementById("lista-solucion");
  if (lista) lista.innerHTML = "";
}

const startBtn = document.getElementById("start-button");
if (startBtn) {
  startBtn.addEventListener("click", () => {
    const startScreen = document.getElementById("start-screen");
    if (startScreen) startScreen.style.display = "none";
    initGame();
  });
}

function manejarClick(i, j) {
  tableroActual = clickearCasilla(i, j, tableroActual);
  generarVistaTablero(tableroActual, manejarClick);
  console.log(tableroActual);
}

console.log("Tablero inicial:", tableroBase);

const tamPoblacion = 200;
const tamCromosoma = 50;
const porcentajeTorneo = 25;
const porcentajeElitismo = 10;
const porcentajeMutacion = 10;
const numGeneraciones = 3000;

document.getElementById("boton-rendirse").addEventListener("click", async () => {
  const copiaGA = tableroActual.map(f => [...f]);

  const sol = ag(
    numGeneraciones,
    tamPoblacion,
    tamCromosoma,
    porcentajeTorneo,
    porcentajeMutacion,
    porcentajeElitismo,
    copiaGA
  );

  if (sol && sol[1] === 0) {

    console.log("Tablero antes de solución:", copiaGA);
    console.log("Solución encontrada:", sol[0]);
  
    mostrarSolucion(sol[0]);

    tableroActual = await aplicarSecuenciaConAnimacion(copiaGA, sol[0], 250);
    
    //Esperar 1 segundo antes de regenerar la vista del tablero al que se le aplica el AG.
    await new Promise(res => setTimeout(res, 1000));
    
    generarVistaTablero(copiaGA, manejarClick);

    tableroActual = copiaGA;
    
  } else {
    
    console.log("No se encontró solución en el límite de generaciones");
    const lista = document.getElementById("lista-solucion");
    if (lista) {
      lista.innerHTML = "";
      const li = document.createElement('li');
      li.textContent = 'No se encontró solución';
      lista.appendChild(li);
    }
  }
});

document.getElementById("boton-rehacer").addEventListener("click", () => {
  initGame();
});

//Traduce la solución.
function coordToLabel([r, c]) {
  const filas = ['A','B','C','D','E'];
  const fila = filas[r] || '?';
  const col = (c + 1) || '?';
  return `${fila}${col}`;
}

//Rellena la lista con la solución de el tablero.
function mostrarSolucion(cromosoma) {
  const lista = document.getElementById('lista-solucion');
  if (!lista) return;
  lista.innerHTML = '';

  for (let i = 0; i < cromosoma.length; i++) {
    const paso = cromosoma[i];
    if (!Array.isArray(paso) || paso.length < 2) continue;
    const li = document.createElement('li');
    const label = coordToLabel(paso);
    li.textContent = `${i + 1}. ${label}`;
    lista.appendChild(li);
  }
}


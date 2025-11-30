import { generarVistaTablero, generarTablero, clickearCasilla } from "./generarTablero.js";
import { ag, aplicarSecuenciaConAnimacion } from "./AG.js";

let tableroBase = null;
let tableroActual = null;

function initGame() {
  tableroBase = generarTablero();
  tableroActual = tableroBase.map(f => [...f]);
  generarVistaTablero(tableroActual, manejarClick);
}

// Start button: hide start screen and initialize game
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

const tamPoblacion = 150;
const tamCromosoma = 50;
const porcentajeTorneo = 25;
const porcentajeElitismo = 10;
const porcentajeMutacion = 10;
const numGeneraciones = 2000;

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
    tableroActual = await aplicarSecuenciaConAnimacion(copiaGA, sol[0], 250);
    generarVistaTablero(tableroActual, manejarClick);
    

  } else {
    
    console.log("No se encontró solución en el límite de generaciones");
  }
});


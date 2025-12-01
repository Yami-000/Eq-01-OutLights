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

  if (tableroGanado(tableroActual)) {
    mostrarModalVictoria();
  }
}
// Verifica si todas las luces están apagadas (todos los valores en 0)
function tableroGanado(tablero) {
  for (let i = 0; i < tablero.length; i++) {
    for (let j = 0; j < tablero[i].length; j++) {
      if (tablero[i][j] !== 0) return false;
    }
  }
  return true;
}

// Muestra el modal de victoria
function mostrarModalVictoria() {
  let modal = document.getElementById('modal-victoria');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-victoria';
    modal.className = 'modal-victoria';

    const box = document.createElement('div');
    box.className = 'modal-victoria-box';

    const msg = document.createElement('h2');
    msg.textContent = '¡Has ganado!';
    msg.className = 'modal-victoria-msg';

    const btn = document.createElement('button');
    btn.textContent = 'Volver a jugar';
    btn.className = 'modal-victoria-btn';
    btn.onclick = () => {
      modal.style.display = 'none';
      initGame();
    };

    box.appendChild(msg);
    box.appendChild(btn);
    modal.appendChild(box);
    document.body.appendChild(modal);
  } else {
    modal.style.display = 'flex';
  }
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

  mostrarModalLoader();

  // Allow the browser to paint the modal before running the synchronous GA
  await new Promise(res => setTimeout(res, 50));

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

    // animate the solution (this function already updates the view during the animation)
    tableroActual = await aplicarSecuenciaConAnimacion(copiaGA, sol[0], 250);
    
    // small delay to let final animation frame settle
    await new Promise(res => setTimeout(res, 300));
    
    // regenerate the view for the final tablero state
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

  // Hide loader only after everything (AG + animation + render) is complete
  ocultarModalLoader();
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

// Muestra el modal con loader durante la ejecución del AG
function mostrarModalLoader() {
  let modal = document.getElementById('modal-loader');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-loader';
    modal.className = 'modal-loader';

    const content = document.createElement('div');
    content.className = 'modal-content';

    const loader = document.createElement('div');
    loader.className = 'sk-cube-grid';
    for (let i = 1; i <= 9; i++) {
      const cube = document.createElement('div');
      cube.className = `sk-cube sk-cube${i}`;
      loader.appendChild(cube);
    }

    const text = document.createElement('div');
    text.className = 'loader-text';
    text.textContent = 'Cargando…';

    content.appendChild(loader);
    content.appendChild(text);
    modal.appendChild(content);
    document.body.appendChild(modal);
  } else {
    modal.style.display = 'flex';
  }
}

// Oculta el modal con loader
function ocultarModalLoader() {
  const modal = document.getElementById('modal-loader');
  if (modal) {
    modal.style.display = 'none';
  }
}


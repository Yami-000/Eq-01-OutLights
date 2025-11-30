export function clickearCasilla(i, j, tablero) {
  const nuevo = tablero.map(f => [...f]);

  toggle(i, j, nuevo);
  toggle(i - 1, j, nuevo);
  toggle(i + 1, j, nuevo);
  toggle(i, j - 1, nuevo);
  toggle(i, j + 1, nuevo);

  return nuevo;
}

function toggle(i, j, tablero) {
  if (i < 0 || i >= 5 || j < 0 || j >= 5) return;
  tablero[i][j] = tablero[i][j] === 1 ? 0 : 1;
}

export function generarTablero() {
  let tablero = Array.from({ length: 5 }, () => Array(5).fill(0));
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      if (Math.random() < 0.5) {
        tablero = clickearCasilla(i, j, tablero);
      }
    }
  }
  return tablero;
}

export function generarVistaTablero(tablero, onClick) {
  const contenedor = document.getElementById("tablero");
  contenedor.innerHTML = "";

  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const estado = tablero[i][j];

      const btn = document.createElement("button");
      btn.classList.add("boton-base");
      btn.dataset.row = i;
      btn.dataset.col = j;
      btn.classList.add(estado === 1 ? "boton-on" : "boton-off");

      // ← aquí ejecuta el callback recibido (que actualizará el estado global)
      btn.addEventListener("click", () => onClick(i, j));

      contenedor.appendChild(btn);
    }
  }
}


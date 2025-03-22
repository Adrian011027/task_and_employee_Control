// menu.js
import { getAllTasks, animateCounter, getCurrentDayName } from './utils.js';
import { mostrarVistaCalendario } from './calendario.js';
import { mostrarTareasPendientes } from './tareaspendientes.js';
import { mostrarTareasCompletadas } from './tareascompletadas.js';
import { mostrarTareasExtras } from './tareasextras.js';

export function mostrarMenuOpciones(empleado) {
  const container = document.getElementById("calendario-container");
  container.innerHTML = "";
  container.style.display = "block";
  container.style.animation = "none";
  void container.offsetWidth;
  container.style.animation = "fadeUp 0.5s ease forwards";

  const allTasks = getAllTasks(empleado);
  const currentDay = getCurrentDayName().toLowerCase();

  // --- Contar tareas pendientes (estatus 1 o 2) para HOY ---
  const pendingTasksForToday = allTasks.filter(
    task =>
      (task.estatus === 1 || task.estatus === 2) &&
      task.dia?.toLowerCase() === currentDay
  );
  const pendingTasksCount = pendingTasksForToday.length;

  // --- Contar tareas completadas (estatus 0) DE TODOS LOS TIEMPOS ---
  const completedTasksAllTime = allTasks.filter(
    task => task.estatus === 0
  );
  const completedTasksCount = completedTasksAllTime.length;

  // --- Contar tareas extras (estatus 3) en general ---
  const extrasTasks = allTasks.filter(task => task.estatus === 3);
  const extrasCount = extrasTasks.length;

  // Iconos en SVG (inline)
  const svgCalendar = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"
         viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>`;

  const svgPending = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"
         viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="14" height="18" rx="2" ry="2"></rect>
      <line x1="7" y1="3" x2="7" y2="21"></line>
      <polygon points="17,7 21,7 19,11"></polygon>
      <line x1="19" y1="8" x2="19" y2="10"></line>
      <circle cx="19" cy="11.5" r="0.8"></circle>
    </svg>`;

  const svgCompleted = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"
         viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="14" height="18" rx="2" ry="2"></rect>
      <line x1="7" y1="3" x2="7" y2="21"></line>
      <polyline points="17 9 19 11 21 7"></polyline>
    </svg>`;

  // Icono para Tareas Extras
  const svgExtras = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"
         viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 6H21V20H8z"></path>
      <path d="M8 6L3 6 3 20 8 20"></path>
      <path d="M8 10L21 10"></path>
    </svg>`;

  // Contenedor principal del menú
  const menuContainer = document.createElement("div");
  menuContainer.classList.add("menu-empleado-container");

  // ---------- Opción Calendario ----------
  const opcionCalendario = document.createElement("div");
  opcionCalendario.classList.add("menu-option", "card");
  opcionCalendario.innerHTML = `
    <div class="card-image">
      ${svgCalendar}
    </div>
    <div class="card-content">
      <div class="card-top">
        <p class="card-title">Calendario</p>
      </div>
    </div>
  `;
  opcionCalendario.addEventListener("click", () => {
    mostrarVistaCalendario(empleado, 5, () => {
      mostrarMenuOpciones(empleado);
    });
  });

  // ---------- Opción Tareas Pendientes (para HOY) ----------
  const opcionPendientes = document.createElement("div");
  opcionPendientes.classList.add("menu-option", "card");
  opcionPendientes.innerHTML = `
    <div class="card-image">
      ${svgPending}
    </div>
    <div class="card-content">
      <div class="card-top">
        <p class="card-title">Tareas Pendientes del Día</p>
      </div>
      <span class="counter-number badge badge-pending">0</span>
    </div>
  `;
  opcionPendientes.addEventListener("click", () => {
    mostrarTareasPendientes(empleado);
  });

  // ---------- Opción Tareas Completadas (TODOS los tiempos) ----------
  const opcionCompletadas = document.createElement("div");
  opcionCompletadas.classList.add("menu-option", "card");
  opcionCompletadas.innerHTML = `
    <div class="card-image">
      ${svgCompleted}
    </div>
    <div class="card-content">
      <div class="card-top">
        <p class="card-title">Historial de Tareas Completadas</p>
      </div>
    </div>
    <span class="counter-number badge badge-completed">0</span>
  `;
  opcionCompletadas.addEventListener("click", () => {
    mostrarTareasCompletadas(empleado);
  });

  // ---------- Opción Tareas Extras (estatus 3) ----------
  const opcionTareasExtras = document.createElement("div");
  opcionTareasExtras.classList.add("menu-option", "card");
  opcionTareasExtras.innerHTML = `
    <div class="card-image">
      ${svgExtras}
    </div>
    <div class="card-content">
      <div class="card-top">
        <p class="card-title">Tareas Extras</p>
      </div>
      <span class="counter-number badge badge-extras">0</span>
    </div>
  `;
  opcionTareasExtras.addEventListener("click", () => {
    mostrarTareasExtras(empleado);
  });

  // Agregamos las opciones al contenedor del menú
  menuContainer.appendChild(opcionCalendario);
  menuContainer.appendChild(opcionPendientes);
  menuContainer.appendChild(opcionCompletadas);
  menuContainer.appendChild(opcionTareasExtras);
  container.appendChild(menuContainer);

  // --- Contador de Tareas Pendientes (solo día actual) ---
  const pendingCounterElem = opcionPendientes.querySelector('.counter-number');
  if (pendingTasksCount > 0) {
    animateCounter(pendingCounterElem, pendingTasksCount);
  } else {
    pendingCounterElem.style.display = 'none';
  }

  // --- Contador de Tareas Completadas (TODOS los tiempos) ---
  const completedCounterElem = opcionCompletadas.querySelector('.counter-number');
  // Muestra el número total de tareas con estatus=0
  if (completedTasksCount > 0) {
    animateCounter(completedCounterElem, completedTasksCount);
  } else {
    completedCounterElem.style.display = 'none';
  }

  // --- Contador de Tareas Extras (estatus 3) ---
  const extrasCounterElem = opcionTareasExtras.querySelector('.counter-number');
  if (extrasCount > 0) {
    animateCounter(extrasCounterElem, extrasCount);
  } else {
    extrasCounterElem.style.display = 'none';
  }
}

export default mostrarMenuOpciones;

import { getAllTasks } from './utils.js';

// Generar intervalos de tiempo
function generateTimeSlots(startHour, endHour, interval = 1) {
  const slots = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const hh = hour.toString().padStart(2, '0');
      const mm = minute.toString().padStart(2, '0');
      slots.push(`${hh}:${mm}`);
    }
  }
  return slots;
}

export function inicializarCalendario(container, interval = 1) {
  const calendarDiv = document.createElement("div");
  calendarDiv.classList.add("calendar");

  const timelineDiv = document.createElement("div");
  timelineDiv.classList.add("timeline");

  const timeSlots = generateTimeSlots(7, 19, interval);
  timeSlots.forEach(time => {
    const timeDiv = document.createElement("div");
    timeDiv.classList.add("timeline-hour");
    timeDiv.textContent = time;
    timelineDiv.appendChild(timeDiv);
  });

  const daysDiv = document.createElement("div");
  daysDiv.classList.add("days");

  ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].forEach((dayName, d) => {
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day");

    const dayHeader = document.createElement("div");
    dayHeader.classList.add("day-header");
    dayHeader.textContent = dayName;

    const eventsDiv = document.createElement("div");
    eventsDiv.classList.add("events");
    eventsDiv.style.gridTemplateRows = `repeat(${timeSlots.length}, var(--timeHeight))`;
    eventsDiv.setAttribute("data-day", d);

    dayDiv.appendChild(dayHeader);
    dayDiv.appendChild(eventsDiv);
    daysDiv.appendChild(dayDiv);
  });

  calendarDiv.appendChild(timelineDiv);
  calendarDiv.appendChild(daysDiv);
  container.appendChild(calendarDiv);

  return { timeSlots, interval };
}

// Mapeo día => índice
const dayIndices = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6
};

function obtenerColorBorde(tarea, dayIndex, ahora) {
  const [startHour, startMinute] = tarea.hora[0].split(":");
  const [endHour, endMinute] = tarea.hora[1].split(":");

  const fechaTarea = new Date(ahora);
  // Ajustar la fecha al día correspondiente (domingo=0, lunes=1, etc.)
  fechaTarea.setDate(ahora.getDate() - (ahora.getDay() - dayIndex));

  const inicio = new Date(
    fechaTarea.getFullYear(),
    fechaTarea.getMonth(),
    fechaTarea.getDate(),
    startHour,
    startMinute
  );
  const fin = new Date(
    fechaTarea.getFullYear(),
    fechaTarea.getMonth(),
    fechaTarea.getDate(),
    endHour,
    endMinute
  );

  // Borde según lógica:
  //  - estatus 0 -> verde
  if (tarea.estatus === 0) return "#28a745"; 
  //  - si aún no llega la hora de inicio -> gris
  if (ahora < inicio) return "#808080";
  //  - si está dentro del rango de inicio-fin -> amarillo
  if (ahora >= inicio && ahora <= fin) return "#FFD700";
  //  - si ya pasó -> rojo
  return "#dc3545";
}

/**
 * Muestra el Calendario con un botón de flecha para regresar.
 * @param {Object} empleado - Datos del empleado seleccionado
 * @param {number} interval - Intervalo de 5 minutos en la grilla, p.ej.
 * @param {Function} onBack - Callback que regresa al menú del mismo empleado
 */
export function mostrarVistaCalendario(empleado, interval = 5, onBack) {
  const calendarioContainer = document.getElementById("calendario-container");
  calendarioContainer.innerHTML = "";

  // Botón flecha
  const arrowBtn = document.createElement("div");
  arrowBtn.classList.add("arrow");
  arrowBtn.style.position = "absolute";
  arrowBtn.style.top = "20px";
  arrowBtn.style.left = "20px";
  arrowBtn.style.zIndex = "999";

  arrowBtn.addEventListener("click", () => {
    if (typeof onBack === "function") {
      onBack(); // Regresa al menú de este empleado
    } else {
      console.log("No hay callback definido para regresar al menú.");
    }
  });

  // Posicionamiento relativo del contenedor
  calendarioContainer.style.position = "relative";
  calendarioContainer.appendChild(arrowBtn);

  // Layout principal
  const layoutContainer = document.createElement("div");
  layoutContainer.classList.add("calendario-layout");

  const calendarWrapper = document.createElement("div");
  calendarWrapper.classList.add("calendar-wrapper");

  const tasksListWrapper = document.createElement("div");
  tasksListWrapper.classList.add("tasks-list-wrapper");

  layoutContainer.appendChild(calendarWrapper);
  layoutContainer.appendChild(tasksListWrapper);
  calendarioContainer.appendChild(layoutContainer);

  // Inicializa la grilla de calendario
  const { timeSlots } = inicializarCalendario(calendarWrapper, interval);
  const slotsPerHour = 60 / interval;

  // Paleta de colores para los eventos
  const colorPalette = ["#FFD700", "#87CEEB", "#FF6347", "#90EE90", "#FFA500", "#DA70D6"];
  const colorMap = {};

  function getColorForTask(taskId) {
    if (!colorMap[taskId]) {
      // Para la tarea con "taskId", elegimos el siguiente color de la paleta
      colorMap[taskId] = colorPalette[Object.keys(colorMap).length % colorPalette.length];
    }
    return colorMap[taskId];
  }

  const allTasks = getAllTasks(empleado);
  // Estatus 0,1,2,3 => sin iniciar, pendiente, en curso, ...
  const tasksInProgressOrPending = allTasks.filter(t => [0, 1, 2, 3].includes(t.estatus));
  const ahora = new Date();

  // -- DIBUJO DE TAREAS EN EL CALENDARIO --
  tasksInProgressOrPending.forEach(tarea => {
    const dayIndex = dayIndices[tarea.dia.toLowerCase()];
    const eventsDiv = calendarWrapper.querySelector(`.events[data-day='${dayIndex}']`);

    // Horas de inicio/fin
    const [startH, startM] = tarea.hora[0].split(":").map(Number);
    const [endH, endM] = tarea.hora[1].split(":").map(Number);

    // Calcular posición en la grilla
    const rowStart = (startH - 7) * slotsPerHour + (startM / interval) + 1;
    const rowEnd = (endH - 7) * slotsPerHour + (endM / interval) + 1;

    // Crear div para el evento
    const eventDiv = document.createElement("div");
    eventDiv.classList.add("event");
    eventDiv.style.gridRowStart = rowStart;
    eventDiv.style.gridRowEnd = rowEnd;
    eventDiv.style.backgroundColor = getColorForTask(tarea.id);
    eventDiv.style.border = `6px solid ${obtenerColorBorde(tarea, dayIndex, ahora)}`;
    eventDiv.title = `${tarea.nombre} - ${tarea.descripcion}`;

    eventsDiv.appendChild(eventDiv);
  });

  // -- LISTA DE TAREAS EN LA PARTE DERECHA --
  const listTitle = document.createElement("h3");
  listTitle.textContent = "Tarea Semanal";
  tasksListWrapper.appendChild(listTitle);

  const ul = document.createElement("ul");
  ul.classList.add("tasks-list");

  // Filtramos para obtener tareas únicas por ID
  const uniqueTasks = tasksInProgressOrPending.filter(
    (tarea, index, arr) => index === arr.findIndex((t) => t.id === tarea.id)
  );

  uniqueTasks.forEach(tarea => {
    const li = document.createElement("li");
    li.textContent = tarea.nombre;
    li.style.borderLeft = `10px solid ${getColorForTask(tarea.id)}`;
    li.style.paddingLeft = "10px";
    ul.appendChild(li);
  });

  tasksListWrapper.appendChild(ul);
}

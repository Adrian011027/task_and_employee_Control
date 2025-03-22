// utils.js

// Función para obtener la lista de empleados
export async function obtenerEmpleados() {
  try {
    const response = await fetch("/empleados");
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    const empleados = await response.json();
    console.log("Lista de empleados:", empleados);
    return empleados;
  } catch (error) {
    console.error("Error al obtener empleados:", error);
    return [];
  }
}

// Función para animar el contador de 0 al número objetivo
export function animateCounter(element, target) {
  let current = 0;
  const duration = 1000; // duración total de la animación en ms
  const stepTime = 20;   // tiempo entre actualizaciones en ms
  const step = target / (duration / stepTime);
  const interval = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(interval);
    }
    element.textContent = Math.floor(current);
  }, stepTime);
}

// Función auxiliar para aplanar las tareas
// "tareas_asignadas" es un objeto con arrays para cada día de la semana
export function getAllTasks(empleado) {
  let tasks = [];
  if (!empleado || !empleado.tareas_asignadas) return tasks;

  // Recorremos cada propiedad del objeto (lunes, martes, etc.)
  // y cada valor es el arreglo de tareas de ese día
  Object.entries(empleado.tareas_asignadas).forEach(([diaKey, dayTasks]) => {
    if (Array.isArray(dayTasks)) {
      dayTasks.forEach(task => {
        // Agregamos la propiedad "dia" con el nombre de la clave (p.ej. "lunes")
        tasks.push({ ...task, dia: diaKey });
      });
    }
  });

  return tasks;
}

// Helper: Obtener el nombre del día actual en minúsculas
export function getCurrentDayName() {
  const days = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
  const now = new Date();
  return days[now.getDay()];
}

// Helper: Capitalizar la primera letra de un string
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Función para mostrar el detalle de tareas en una vista
export function mostrarDetalleTareas(tasks, type) {
  const container = document.getElementById("calendario-container");
  container.innerHTML = "";
  container.style.display = "block";
  container.style.animation = "none";
  void container.offsetWidth;
  container.style.animation = "fadeUp 0.5s ease forwards";

  const header = document.createElement("h2");
  header.textContent = `Detalle de tareas ${type}`;
  container.appendChild(header);

  const list = document.createElement("ul");
  list.classList.add("task-list");
  tasks.forEach(task => {
    const item = document.createElement("li");
    item.textContent = `${task.nombre} - ${task.hora ? task.hora.join(" - ") : ""} (${task.dia ? capitalize(task.dia) : ""})`;
    list.appendChild(item);
  });
  container.appendChild(list);

  // Botón "Volver" para regresar al menú principal
  const backBtn = document.createElement("button");
  backBtn.textContent = "Volver";
  backBtn.addEventListener("click", () => {
    if (window.currentEmpleado) {
      import('./menu.js').then(module => {
        module.mostrarMenuOpciones(window.currentEmpleado);
      });
    }
  });
  container.appendChild(backBtn);
}

import { getAllTasks, getCurrentDayName, capitalize } from './utils.js';
// Importamos la función para volver al menú
import { mostrarMenuOpciones } from './menu.js';

export function mostrarTareasPendientes(empleado) {
  const container = document.getElementById("calendario-container");
  container.innerHTML = "";
  container.style.display = "";
  container.style.animation = "none";
  void container.offsetWidth;
  container.style.animation = "fadeUp 0.5s ease forwards";

  // Aseguramos que el contenedor sea "relative" para colocar la flecha
  container.style.position = "relative";

  // Botón flecha
  const arrowBtn = document.createElement("div");
  arrowBtn.classList.add("arrow");
  arrowBtn.style.position = "absolute";
  arrowBtn.style.top = "20px";
  arrowBtn.style.left = "20px";
  arrowBtn.style.zIndex = "999";
  arrowBtn.addEventListener("click", () => {
    // Regresamos al menú del empleado
    mostrarMenuOpciones(empleado);
  });
  container.appendChild(arrowBtn);

  // Estilo general
  container.classList.add("pending");

  // Obtiene todas las tareas y filtra las pendientes (estatus 1 o 2)
  const allTasks = getAllTasks(empleado);
  const pendingTasks = allTasks.filter(task => task.estatus === 1 || task.estatus === 2);

  // Determina el día actual (ej. "lunes", "martes", etc.)
  const currentDay = getCurrentDayName().toLowerCase();

  // Filtra solo las pendientes del día actual
  const tasksForToday = pendingTasks.filter(
    task => task.dia && task.dia.toLowerCase() === currentDay
  );

  // Si no hay tareas pendientes hoy, mensaje y salir
  if (tasksForToday.length === 0) {
    const message = document.createElement("p");
    message.textContent = "No hay tareas pendientes para hoy.";
    container.appendChild(message);
    return;
  }

  // --- Contenedor flex para la tabla y la paginación ---
  const wrapper = document.createElement("div");
  wrapper.classList.add("pending-table-wrapper");
  // Esto hará que tabla y paginación queden en un solo bloque.

  // Contenedor para la tabla (lo usaremos como "zona flexible")
  const tableContainer = document.createElement("div");
  tableContainer.classList.add("pending-table-content");

  // Crear la tabla
  const table = document.createElement("table");
  table.classList.add("custom-table", "pending-day-table");

  // Encabezado
  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr style="border-bottom: 2px solid #bfbfbf;">
      <th>Nombre</th>
      <th>Descripción</th>
      <th>Fecha</th>
      <th>Hora</th>
    </tr>
  `;
  table.appendChild(thead);

  // Cuerpo de la tabla
  const tbody = document.createElement("tbody");
  table.appendChild(tbody);

  // Agregar la tabla al contenedor de la tabla
  tableContainer.appendChild(table);

  // Agregar el contenedor de la tabla al wrapper
  wrapper.appendChild(tableContainer);

  // Configuración de paginación: 3 tareas por página
  const tasksPerPage = 3;
  const totalPages = Math.ceil(tasksForToday.length / tasksPerPage);
  let currentPage = 1;

  // Función para renderizar una página dada
  function renderPage(page) {
    tbody.innerHTML = "";
    const start = (page - 1) * tasksPerPage;
    const end = start + tasksPerPage;
    const tasksToShow = tasksForToday.slice(start, end);

    tasksToShow.forEach(task => {
      const tr = document.createElement("tr");
      const fecha = task.fecha ? task.fecha : capitalize(currentDay);
      const hora = task.hora ? task.hora.join(" - ") : "";
      tr.innerHTML = `
        <td>${task.nombre}</td>
        <td>${task.descripcion}</td>
        <td>${fecha}</td>
        <td>${hora}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Renderizar la primera página
  renderPage(currentPage);

  // Si hay más de una página, crear la paginación (bolitas)
  if (totalPages > 1) {
    const paginationContainer = document.createElement("div");
    paginationContainer.classList.add("pagination-container");

    for (let i = 1; i <= totalPages; i++) {
      const dot = document.createElement("span");
      dot.classList.add("pagination-dot");
      if (i === currentPage) {
        dot.classList.add("active");
      }
      dot.addEventListener("click", () => {
        if (currentPage === i) return;

        const previousPage = currentPage;
        currentPage = i;

        let animationStyle;
        if (currentPage > previousPage) {
          // Avanzando: el contenido aparece desde la derecha
          animationStyle = "fadeRightToLeft 0.5s ease forwards";
        } else {
          // Retrocediendo: el contenido aparece desde la izquierda
          animationStyle = "fadeLeftToRight 0.5s ease forwards";
        }

        // Reinicia la animación del contenedor
        container.style.animation = "none";
        void container.offsetWidth; // Forzar reflow para reiniciar la animación
        container.style.animation = animationStyle;

        // Renderiza la nueva página
        renderPage(currentPage);

        // Actualiza la clase "active" en las bolitas de paginación
        const dots = paginationContainer.querySelectorAll(".pagination-dot");
        dots.forEach((d, index) => {
          if (index + 1 === currentPage) {
            d.classList.add("active");
          } else {
            d.classList.remove("active");
          }
        });
      });
      
      paginationContainer.appendChild(dot);
    }
    // Agregar la paginación debajo de la tabla
    wrapper.appendChild(paginationContainer);
  }

  // Finalmente, agregar el wrapper al contenedor principal
  container.appendChild(wrapper);
}

// tareassextras.js
import { getAllTasks, capitalize } from './utils.js';
import { mostrarMenuOpciones } from './menu.js';

// Esta función muestra en pantalla únicamente las tareas de estatus 3
export function mostrarTareasExtras(empleado) {
  const container = document.getElementById("calendario-container");
  container.innerHTML = "";
  container.style.display = "block";
  container.style.animation = "none";
  void container.offsetWidth;
  container.style.animation = "fadeUp 0.5s ease forwards";

  // Aseguramos que el contenedor sea "relative" (igual que en tareaspendientes.js)
  container.style.position = "relative";

  // -- Botón flecha (para volver al menú) --
  const arrowBtn = document.createElement("div");
  arrowBtn.classList.add("arrow");
  arrowBtn.style.position = "absolute";
  arrowBtn.style.top = "20px";
  arrowBtn.style.left = "20px";
  arrowBtn.style.zIndex = "999";
  arrowBtn.addEventListener("click", () => {
    mostrarMenuOpciones(empleado);
  });
  container.appendChild(arrowBtn);

  // Agregamos la misma clase que se usa en tareas pendientes (para reutilizar CSS)
  container.classList.add("pending");

  // 1. Obtener todas las tareas del empleado
  const allTasks = getAllTasks(empleado);

  // 2. Filtrar SOLO aquellas tareas con estatus = 3
  const extraTasks = allTasks.filter(task => task.estatus === 3);

  // 3. Si no hay tareas extras, mensaje y salir
  if (extraTasks.length === 0) {
    const message = document.createElement("p");
    message.textContent = "No hay tareas extras asignadas.";
    container.appendChild(message);
    return;
  }


  // --- Contenedor flex para la tabla y la paginación (igual que tareaspendientes.js) ---
  const wrapper = document.createElement("div");
  wrapper.classList.add("pending-table-wrapper");

  // Contenedor para la tabla
  const tableContainer = document.createElement("div");
  tableContainer.classList.add("pending-table-content");

  // Crear la tabla
  const table = document.createElement("table");
  table.classList.add("custom-table", "pending-day-table");

  // Encabezado de la tabla
  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr style="border-bottom: 2px solid #bfbfbf;">
      <th>Nombre</th>
      <th>Descripción</th>
      <th>Día</th>
      <th>Hora</th>
    </tr>
  `;
  table.appendChild(thead);

  // Cuerpo de la tabla
  const tbody = document.createElement("tbody");
  table.appendChild(tbody);

  // Insertamos la tabla en su contenedor
  tableContainer.appendChild(table);

  // Insertamos el contenedor de la tabla en el wrapper
  wrapper.appendChild(tableContainer);

  // Configuración de paginación: 3 tareas por página (igual que en pendientes)
  const tasksPerPage = 3;
  const totalPages = Math.ceil(extraTasks.length / tasksPerPage);
  let currentPage = 1;

  // Función para renderizar una página dada
  function renderPage(page) {
    tbody.innerHTML = "";
    const start = (page - 1) * tasksPerPage;
    const end = start + tasksPerPage;
    const tasksToShow = extraTasks.slice(start, end);

    tasksToShow.forEach(task => {
      const tr = document.createElement("tr");

      // Muestra la hora, el día, etc. adaptado a tu contenido
      const diaMostrado = task.dia ? capitalize(task.dia) : "-";
      const horaMostrada = task.hora ? task.hora.join(" - ") : "-";
      const descripcion = task.descripcion || "Sin descripción";

      tr.innerHTML = `
        <td>${task.nombre}</td>
        <td>${descripcion}</td>
        <td>${diaMostrado}</td>
        <td>${horaMostrada}</td>
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

        // Actualiza la clase "active" en los dots
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

    wrapper.appendChild(paginationContainer);
  }

  // Finalmente, agregar el wrapper al contenedor principal
  container.appendChild(wrapper);
}

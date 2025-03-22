import { getAllTasks, capitalize } from './utils.js';
// Importamos la función para volver al menú
import { mostrarMenuOpciones } from './menu.js';

export function mostrarTareasCompletadas(empleado) {
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

  // Aplicar la misma clase para aprovechar los estilos que tengas en tu CSS
  container.classList.add("pending");

  // 1) Obtener todas las tareas
  const allTasks = getAllTasks(empleado);

  // 2) Filtrar solo las que tienen estatus = 0
  const sinIniciarTasks = allTasks.filter(task => task.estatus === 0);

  // Mostramos TODAS las tareas con estatus=0, sin importar el día
  const tasksToShow = sinIniciarTasks;

  // 5) Si no hay tareas con estatus 0, mostrar un mensaje y salir
  if (tasksToShow.length === 0) {
    const message = document.createElement("p");
    message.textContent = "No hay tareas con estatus 0.";
    container.appendChild(message);
    return;
  }

  // Contenedor principal (tabla y paginación)
  const wrapper = document.createElement("div");
  wrapper.classList.add("pending-table-wrapper");

  // Contenedor de la tabla
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
      <th>Fecha</th>
      <th>Hora</th>
    </tr>
  `;
  table.appendChild(thead);

  // Cuerpo de la tabla
  const tbody = document.createElement("tbody");
  table.appendChild(tbody);

  // Insertamos la tabla en su contenedor y luego el contenedor en el wrapper
  tableContainer.appendChild(table);
  wrapper.appendChild(tableContainer);

  // Configuración de paginación: 3 tareas por página
  const tasksPerPage = 3;
  const totalPages = Math.ceil(tasksToShow.length / tasksPerPage);
  let currentPage = 1;

  // Función para renderizar una página concreta
  function renderPage(page) {
    tbody.innerHTML = "";
    const start = (page - 1) * tasksPerPage;
    const end = start + tasksPerPage;
    const slicedTasks = tasksToShow.slice(start, end);

    slicedTasks.forEach(task => {
      const tr = document.createElement("tr");
      // Si no hay fecha, mostramos el campo vacío u otra lógica
      const fecha = task.fecha || "";
      // Si no hay hora, se deja vacío; si hay, unimos con guión
      const hora = task.hora ? task.hora.join(" - ") : "";

      tr.innerHTML = `
        <td>${task.nombre}</td>
        <td>${task.descripcion || ''}</td>
        <td>${fecha}</td>
        <td>${hora}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Renderizamos la primera página
  renderPage(currentPage);

  // Si hay más de una página, configuramos la paginación
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
        if (currentPage === i) return; // No recarga si ya estamos en la misma página

        const previousPage = currentPage;
        currentPage = i;

        // Elige animación según si avanzamos o retrocedemos
        let animationStyle;
        if (currentPage > previousPage) {
          animationStyle = "fadeRightToLeft 0.5s ease forwards";
        } else {
          animationStyle = "fadeLeftToRight 0.5s ease forwards";
        }

        // Reinicia la animación del contenedor
        container.style.animation = "none";
        void container.offsetWidth; // Forzar reflow
        container.style.animation = animationStyle;

        // Renderiza la nueva página
        renderPage(currentPage);

        // Actualiza qué puntito está activo
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

  // Finalmente, agregamos el wrapper al contenedor principal
  container.appendChild(wrapper);
}

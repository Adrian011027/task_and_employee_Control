// main.js
import { obtenerEmpleados } from './utils.js';
import { createEmpleadoCard } from './empleados.js';
import mostrarMenuOpciones from './menu.js';


// Muestra la cuadrícula de TODOS los empleados (modo administrador)
async function generarItinerarios() {
  console.log("Generando itinerarios (ADMIN)...");
  const empleados = await obtenerEmpleados();

  const tarjetasContainer = document.getElementById("tarjetas-container");
  if (!tarjetasContainer) {
    console.error("No existe contenedor con ID 'tarjetas-container'.");
    return;
  }
  tarjetasContainer.innerHTML = "";

  // Creamos tarjeta para cada empleado
  empleados.forEach((empleado, i) => {
    const card = createEmpleadoCard(empleado, i);
    tarjetasContainer.appendChild(card);

    // Si quisieras que al hacer clic en la tarjeta se abra su menú, puedes añadir:
    // card.addEventListener("click", () => {
    //   window.currentEmpleado = empleado;
    //   mostrarMenuOpciones(empleado);
    // });
  });

  // Mostrar informes-content (animación) si existe
  setTimeout(() => {
    const informesContent = document.getElementById("informes-content");
    if (informesContent) {
      informesContent.classList.add("show");
    }
  }, 300);
}

// Evento principal
document.addEventListener("DOMContentLoaded", async () => {
  // 1) Obtener usuario logueado desde localStorage
  const storedUser = localStorage.getItem("loggedUser");
  if (!storedUser) {
    console.warn("No hay usuario logueado en localStorage.");
    return;
  }
  const userData = JSON.parse(storedUser);

  // 2) Leer el rol e ID de empleado
  const userRole = userData.role;           // "administrador" o "empleado"
  const empleadoId = parseInt(userData.empleado_id, 10);

  // 3) Lógica según el rol
  if (userRole === "administrador") {
    // Muestra todas las tarjetas
    generarItinerarios();
  }
  else if (userRole === "empleado") {
    console.log("Modo EMPLEADO: mostrando su tarjeta y menú.");

    // 3.1) Descargar todos los empleados
    const empleados = await obtenerEmpleados();
    // 3.2) Buscar el que corresponda a su empleadoId
    const empleado = empleados.find(e => e.id === empleadoId);

    if (!empleado) {
      console.error("No se encontró empleado con ID:", empleadoId);
      return;
    }

    // 3.3) MOSTRAR SOLO SU TARJETA
    const tarjetasContainer = document.getElementById("tarjetas-container");
    if (!tarjetasContainer) {
      console.error("No existe contenedor con ID 'tarjetas-container' para mostrar la tarjeta.");
      return;
    }
    tarjetasContainer.innerHTML = "";

    const card = createEmpleadoCard(empleado, 0);
    tarjetasContainer.appendChild(card);

    // (Opcional) Puedes dar una animación similar a informes-content
    setTimeout(() => {
      const informesContent = document.getElementById("informes-content");
      if (informesContent) {
        informesContent.classList.add("show");
      }
    }, 300);

    // 3.4) MOSTRAR SU MENÚ (calendario, tareas, etc.) EN PARALELO
    window.currentEmpleado = empleado;
    mostrarMenuOpciones(empleado);

  }
  else {
    console.error("Rol no identificado:", userRole);
  }
});

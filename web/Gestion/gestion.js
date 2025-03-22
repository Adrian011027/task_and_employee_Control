import { mostrar_edit } from './Editar Empleado/Editar Tarea/editar_tarea.js'; 
import { editarPersonalData}  from './Editar Empleado/Datos Personales/datos_del_empleado.js'

export function abrirModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add("active");
  } else {
    console.error(`No se encontró el modal con id="${id}"`);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  /***********************************************************
   * 1. EFECTO FADE-IN AL CARGAR
   ***********************************************************/
  const subContenedor = document.getElementById("contenido-fade");
  if (subContenedor) {
    requestAnimationFrame(() => {
      subContenedor.classList.add("show"); // Desencadena .fade-in.show
    });
  }


  // Menú principal
  const menuPrincipal = document.getElementById("menu-principal");
  
  // Secciones (ocultas al inicio en el HTML con style="display: none;")
  const seccionEditar = document.getElementById("seccion-editar");
 
  // Elementos en la sección EDITAR Empleado
  const listaEmpleados = document.getElementById("lista-empleados");
  const empleadoSeleccionadoTexto = document.getElementById("empleado-seleccionado");
  const opcionesEdicion = document.getElementById("opciones-edicion");

  // Botones “Volver” en cada sección
  const btnVolverEditar = document.getElementById("btn-volver-editar");;

  // Botones en las opciones de edición
  const btnEditarTarea = document.getElementById("btn-editar-tarea");
  const btnDatosEmpleado = document.getElementById("btn-datos-empleado");
  const btnEliminarEmpleado = document.getElementById("btn-eliminar-empleado");
  const btnDP= document.getElementById("btn_edit_dp");
  
  // IDs de los botones del menú principal
  const btnEditarEmpleado = document.getElementById("editar-empleado");

  

  // IMPORTANTE: Declarar la variable global para que crear_tarea.js pueda usarla
  window.empleadoSeleccionadoID = null;

  /***********************************************************
   * 3. INICIALIZACIÓN: OCULTAR SECCIONES
   ***********************************************************/
  seccionEditar.style.display = "none";
  if (opcionesEdicion) {
    opcionesEdicion.style.display = "none";
  }

  /***********************************************************
   * 4. BOTONES DEL MENÚ PRINCIPAL
   ***********************************************************/
  // --- Editar Empleado ---
  btnEditarEmpleado.addEventListener("click", function() {
    menuPrincipal.style.display = "none";
    seccionEditar.style.display = "block";

    listaEmpleados.innerHTML = "";
    empleadoSeleccionadoTexto.textContent = "";
    if (opcionesEdicion) opcionesEdicion.style.display = "none";

    // Cargar lista de empleados desde la API
    fetch("/empleados")
      .then(response => response.json())
      .then(data => {
        console.log("Lista de empleados obtenida:", data);

        let defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Selecciona un empleado";
        listaEmpleados.appendChild(defaultOption);

        data.forEach(emp => {
          let option = document.createElement("option");
          option.value = emp.id;
          option.textContent = emp.nombre;
          listaEmpleados.appendChild(option);
        });
      })
      .catch(error => console.error("Error al obtener empleados:", error));
  });



  /***********************************************************
   * 6. SECCIÓN EDITAR EMPLEADO
   ***********************************************************/
  listaEmpleados.addEventListener("change", function(e) {
    // Asignar globalmente el ID para que crear_tarea.js lo pueda leer
    window.empleadoSeleccionadoID = e.target.value; 
    const empleadoTexto = e.target.options[e.target.selectedIndex].text;

    if (!window.empleadoSeleccionadoID) {
      if (opcionesEdicion) opcionesEdicion.style.display = "none";
      empleadoSeleccionadoTexto.textContent = "";
      return;
    }

    
    empleadoSeleccionadoTexto.textContent = `ID: ${window.empleadoSeleccionadoID} - Nombre: ${empleadoTexto}`;

    if (opcionesEdicion) {
      opcionesEdicion.style.display = "block";
    }
  });

  // Botón Volver (opciones de edición)
  btnVolverEditar.addEventListener("click", function() {
    seccionEditar.style.display = "none";
    menuPrincipal.style.display = "flex";
  });

  /***********************************************************
   * 7. BOTONES DENTRO DE LA SECCIÓN EDITAR
   ***********************************************************/
  // --- Crear Tarea (abre modal-create-task) ---


  // --- Editar Tarea (abre modal-edit-task) ---
  btnEditarTarea.addEventListener("click", function() {
    abrirModal("modal-edit-task");
    // otro-archivo.js
    mostrar_edit(); // Esto imprimirá "Hola desde export"
  });

  btnDP.addEventListener("click", function(){
    editarPersonalData();
  })

  // --- Datos del Empleado (abre modal-edit-personal-data) ---
  btnDatosEmpleado.addEventListener("click", function() {
    abrirModal("modal-edit-personal-data");

    Promise.all([
        fetch(`/empleados/${window.empleadoSeleccionadoID}`).then(res => res.json()),
        fetch(`/user/${window.empleadoSeleccionadoID}`).then(res => res.json())
    ])
    .then(([empleado, user]) => {
        // Llenar datos personales
        document.getElementById("nombre_dp").value = empleado.nombre || "";
        document.getElementById("puesto_dp").value = empleado.puesto || "";
        document.getElementById("username_dp").value = user.username || "";
        document.getElementById("password_dp").value = user.password || "";
        document.getElementById("role_dp").value = user.role || "";

        // Vista previa de imagen (opcional)
        if (empleado.imagen) {
            const preview = document.getElementById("preview");
            preview.src = empleado.imagen;
            preview.style.display = "block";
        }
    })
    .catch(error => {
        console.error("Error al obtener datos:", error);
        alert("No se pudo cargar la información del empleado.");
    });
});

  // --- Eliminar Empleado ---
  btnEliminarEmpleado.addEventListener("click", function() {
    if (!window.empleadoSeleccionadoID) {
      console.log("Primero selecciona un empleado.");
      return;
    }
    if (confirm("¿Estás seguro de que deseas eliminar este empleado?")) {
      fetch(`/empleados/${window.empleadoSeleccionadoID}`, { method: "DELETE" })
        .then(response => {
          if (response.ok) {
            console.log("Empleado eliminado correctamente.");
            seccionEditar.style.display = "none";
            menuPrincipal.style.display = "flex";
          } else {
            console.log("Error al eliminar el empleado.");
          }
        })
        .catch(error => {
          console.error("Error al eliminar empleado:", error);
          console.log("Ocurrió un error en la eliminación.");
        });
    }
  });;

  /***********************************************************
   * 9. ABRIR/CERRAR MODALES (para Tareas, Datos Personales, etc.)
   ***********************************************************/
  
  function cerrarModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove("active");
    }
  }

}); // Fin DOMContentLoaded
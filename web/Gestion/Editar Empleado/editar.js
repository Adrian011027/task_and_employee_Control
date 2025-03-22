document.addEventListener("DOMContentLoaded", function() {
    // Referencias a elementos
    const menuPrincipal = document.getElementById("menu-principal");
    const seccionEditar = document.getElementById("seccion-editar");
    const listaEmpleados = document.getElementById("lista-empleados");
    const empleadoSeleccionadoTexto = document.getElementById("empleado-seleccionado");
    const opcionesEdicion = document.getElementById("opciones-edicion");
  
    // Botones
    const btnEditarEmpleado = document.getElementById("editar-empleado"); // botón del menú principal
    const btnVolverEditar = document.getElementById("btn-volver-editar");
    const btnCrearTarea = document.getElementById("btn-crear-tarea");
    const btnEditarTarea = document.getElementById("btn-editar-tarea");
    const btnDatosEmpleado = document.getElementById("btn-datos-empleado");
    const btnEliminarEmpleado = document.getElementById("btn-eliminar-empleado");
    const btnDP = document.getElementById("btn_edit_dp");
    const btnCrearEnviarTarea = document.getElementById("modal-edit-personal-data_btn");
  
    // Declarar variable global para que otros scripts (ej. crear_tarea.js) puedan usarla
    window.empleadoSeleccionadoID = null;
  
    // Inicialmente ocultar la sección de Editar y las opciones
    if (seccionEditar) seccionEditar.style.display = "none";
    if (opcionesEdicion) opcionesEdicion.style.display = "none";
  
    // Mostrar sección Editar y cargar lista de empleados
    if (btnEditarEmpleado) {
      btnEditarEmpleado.addEventListener("click", function() {
        if (menuPrincipal) menuPrincipal.style.display = "none";
        if (seccionEditar) seccionEditar.style.display = "block";
  
        // Limpiar lista y datos previos
        if (listaEmpleados) listaEmpleados.innerHTML = "";
        if (empleadoSeleccionadoTexto) empleadoSeleccionadoTexto.textContent = "";
        if (opcionesEdicion) opcionesEdicion.style.display = "none";
  
        // Obtener lista de empleados desde la API
        fetch("/empleados")
          .then(response => response.json())
          .then(data => {
            console.log("Lista de empleados obtenida:", data);
  
            if (listaEmpleados) {
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
            }
          })
          .catch(error => console.error("Error al obtener empleados:", error));
      });
    }
  
    // Al seleccionar un empleado de la lista
    if (listaEmpleados) {
      listaEmpleados.addEventListener("change", function(e) {
        window.empleadoSeleccionadoID = e.target.value;
        const empleadoTexto = e.target.options[e.target.selectedIndex].text;
  
        if (!window.empleadoSeleccionadoID) {
          if (opcionesEdicion) opcionesEdicion.style.display = "none";
          if (empleadoSeleccionadoTexto) empleadoSeleccionadoTexto.textContent = "";
          return;
        }
  
        if (empleadoSeleccionadoTexto) {
          empleadoSeleccionadoTexto.textContent = `ID: ${window.empleadoSeleccionadoID} - Nombre: ${empleadoTexto}`;
        }
        if (opcionesEdicion) {
          opcionesEdicion.style.display = "block";
        }
      });
    }
  
    // Botón Volver para regresar al menú principal
    if (btnVolverEditar) {
      btnVolverEditar.addEventListener("click", function() {
        if (seccionEditar) seccionEditar.style.display = "none";
        if (menuPrincipal) menuPrincipal.style.display = "flex";
      });
    }
  
    // Función para abrir un modal (útil para tareas o edición de datos)
    function abrirModal(id) {
      const modal = document.getElementById(id);
      if (modal) {
        modal.classList.add("active");
      } else {
        console.error(`No se encontró el modal con id="${id}"`);
      }
    }
  
    // Botón "Crear Tarea" (abre modal de crear tarea)
    if (btnCrearTarea) {
      btnCrearTarea.addEventListener("click", function() {
        abrirModal("modal-create-task");
      });
    }
  
    // Botón "Editar Tarea" (abre modal de editar tarea)
    if (btnEditarTarea) {
      btnEditarTarea.addEventListener("click", function() {
        abrirModal("modal-edit-task");
        // Se asume que la función mostrar_edit() está definida en otro módulo
        if (typeof mostrar_edit === "function") {
          mostrar_edit();
        }
      });
    }
  
    // Botón para editar datos personales
    if (btnDP) {
      btnDP.addEventListener("click", function(){
        if (typeof editarPersonalData === "function") {
          editarPersonalData();
        }
      });
    }
  
    // Botón para enviar tarea (dentro del modal de datos personales)
    if (btnCrearEnviarTarea) {
      btnCrearEnviarTarea.addEventListener("click", function(){
        if (typeof enviarTarea === "function") {
          enviarTarea();
        }
      });
    }
  
    // Botón "Datos del Empleado" (abre modal para editar datos personales)
    if (btnDatosEmpleado) {
      btnDatosEmpleado.addEventListener("click", function() {
        abrirModal("modal-edit-personal-data");
  
        Promise.all([
          fetch(`/empleados/${window.empleadoSeleccionadoID}`).then(res => res.json()),
          fetch(`/user/${window.empleadoSeleccionadoID}`).then(res => res.json())
        ])
        .then(([empleado, user]) => {
          document.getElementById("nombre_dp").value = empleado.nombre || "";
          document.getElementById("puesto_dp").value = empleado.puesto || "";
          document.getElementById("username_dp").value = user.username || "";
          document.getElementById("password_dp").value = user.password || "";
          document.getElementById("role_dp").value = user.role || "";
  
          // Vista previa de imagen (si existe)
          if (empleado.imagen) {
            const preview = document.getElementById("preview");
            if (preview) {
              preview.src = empleado.imagen;
              preview.style.display = "block";
            }
          }
        })
        .catch(error => {
          console.error("Error al obtener datos:", error);
          alert("No se pudo cargar la información del empleado.");
        });
      });
    }
  
    // Botón "Eliminar Empleado"
    if (btnEliminarEmpleado) {
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
                if (seccionEditar) seccionEditar.style.display = "none";
                if (menuPrincipal) menuPrincipal.style.display = "flex";
              } else {
                console.log("Error al eliminar el empleado.");
              }
            })
            .catch(error => {
              console.error("Error al eliminar empleado:", error);
              console.log("Ocurrió un error en la eliminación.");
            });
        }
      });
    }
  });
  
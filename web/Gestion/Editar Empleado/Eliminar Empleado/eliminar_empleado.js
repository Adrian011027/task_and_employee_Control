const btnEliminarEmpleado = document.getElementById("btn-eliminar-empleado");

btnEliminarEmpleado.addEventListener("click", function() {
    if (!window.empleadoSeleccionadoID) {
      alert("Primero selecciona un empleado.");
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
  });

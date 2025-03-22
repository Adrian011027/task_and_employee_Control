document.addEventListener("DOMContentLoaded", function() {
    // Referencias a elementos
    const menuPrincipal = document.getElementById("menu-principal");
    const seccionRegistrar = document.getElementById("seccion-registrar");
    const btnRegistrarEquipo = document.getElementById("registrar-equipo"); // botón del menú principal
    const btnVolverRegistrar = document.getElementById("btn-volver-registrar");

    // Inicialmente ocultar la sección Registrar
    if (seccionRegistrar) {
      seccionRegistrar.style.display = "none";
    }
  
    // Mostrar la sección al hacer clic en el botón "Registrar Equipo"
    if (btnRegistrarEquipo) {
      btnRegistrarEquipo.addEventListener("click", function() {
        if (menuPrincipal) menuPrincipal.style.display = "none";
        if (seccionRegistrar) seccionRegistrar.style.display = "block";
      });
    }
  
    // Botón Volver para regresar al menú principal
    if (btnVolverRegistrar) {
      btnVolverRegistrar.addEventListener("click", function() {
        if (seccionRegistrar) seccionRegistrar.style.display = "none";
        if (menuPrincipal) menuPrincipal.style.display = "flex";
      });
    }
  });
  
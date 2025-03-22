// archivo: crearEmpleado.js

// Evento para el formulario
document.addEventListener("DOMContentLoaded", function () {
  const formCrear = document.getElementById("form-create-empleado");
  const btnVolverCrear = document.getElementById("btn-volver-crear");
  const btnCrearEmpleado = document.getElementById("crear-empleado");
  const seccionCrear = document.getElementById("seccion-crear");
  const menuPrincipal = document.getElementById("menu-principal");

  if (formCrear) {
    formCrear.addEventListener("submit", async function (event) {
      event.preventDefault();
      await enviarFormularioEmpleado();  // Llamada a la función exportada
    });
  }

  if (btnVolverCrear) {
    btnVolverCrear.addEventListener("click", function () {
      seccionCrear.style.display = "none";
      menuPrincipal.style.display = "flex";
    });
  }

  if (btnCrearEmpleado) {
    btnCrearEmpleado.addEventListener("click", function () {
      menuPrincipal.style.display = "none";
      seccionCrear.style.display = "block";
    });
  }
});

// ✅ Exportar la función correctamente (fuera del evento)
export async function enviarFormularioEmpleado() {
  const form = document.getElementById("form-create-empleado");
  const formData = new FormData(form);

  const username = document.getElementById("username").value;
  const imagen = document.getElementById("imagen").files[0];

  if (!imagen) {
    alert("Por favor, selecciona una imagen.");
    return;
  }

  // Renombrar la imagen con el username antes de enviarla
  const renamedFile = new File([imagen], `${username}.jpg`, { type: imagen.type });

  // Remover la imagen original y agregar la renombrada
  formData.delete("imagen");
  formData.append("imagen", renamedFile);

  try {
    const response = await fetch("/empleados", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const resultado = await response.json();
    console.log("Empleado creado correctamente:", resultado);

    window.location.href = "/gestion";
  } catch (error) {
    console.error("Error al enviar el formulario:", error);
  }
}

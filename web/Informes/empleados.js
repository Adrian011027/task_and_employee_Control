// empleados.js
export function createEmpleadoCard(empleado, index) {
  const card = document.createElement("div");
  card.classList.add("empleado-card");

  // Asignar color en base al índice (0..5)
  const colorClass = `card-color-${index % 6}`;
  card.classList.add(colorClass);

  // Imagen
  const foto = document.createElement("img");
  foto.src = "/web/Images/" + empleado.imagen;
  foto.alt = `Foto de ${empleado.nombre}`;

  // Info
  const infoDiv = document.createElement("div");
  infoDiv.classList.add("empleado-info");

  const nombre = document.createElement("h2");
  nombre.textContent = empleado.nombre;

  const puesto = document.createElement("p");
  puesto.textContent = empleado.puesto;

  infoDiv.appendChild(nombre);
  infoDiv.appendChild(puesto);

  card.appendChild(foto);
  card.appendChild(infoDiv);

  // Al hacer clic, guardar el empleado actual y mostrar el menú principal
  card.addEventListener("click", () => {
    window.currentEmpleado = empleado;
    // Importar el módulo "menu" para mostrar el dashboard
    import('./menu.js').then(module => {
      module.mostrarMenuOpciones(empleado);
    });
  });

  return card;
}

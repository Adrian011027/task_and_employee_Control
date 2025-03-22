import { update } from "./editar_tarea_send.js";

export function mostrar_edit() {
    fetch(`/empleados/${window.empleadoSeleccionadoID}`)
    .then(response => response.json())
    .then(data => {
        const modalEditTask = document.getElementById("modal-edit-task");
        modalEditTask.innerHTML = "<h2>Editar tareas</h2>";

        if (data.tareas_asignadas) {
            Object.entries(data.tareas_asignadas).forEach(([dia, tareas]) => {
                if (tareas.length > 0) {
                    const section = document.createElement("div");
                    section.classList.add("day-section");

                    const dayTitle = document.createElement("h3");
                    dayTitle.textContent =
                        dia.charAt(0).toUpperCase() + dia.slice(1);
                    section.appendChild(dayTitle);

                    tareas.forEach(tarea => {
                        const form = document.createElement("form");
                        form.classList.add("task-form");

                        const nombreInput = document.createElement("input");
                        nombreInput.type = "text";
                        nombreInput.value = tarea.nombre;
                        form.appendChild(nombreInput);

                        const descInput = document.createElement("input");
                        descInput.type = "text";
                        descInput.value = tarea.descripcion;
                        form.appendChild(descInput);

                        const horaInicioInput = document.createElement("input");
                        horaInicioInput.type = "time";
                        horaInicioInput.value = tarea.hora[0];
                        form.appendChild(horaInicioInput);

                        const horaFinInput = document.createElement("input");
                        horaFinInput.type = "time";
                        horaFinInput.value = tarea.hora[1];
                        form.appendChild(horaFinInput);

                        const btnGuardar = document.createElement("button");
                        btnGuardar.type = "submit";
                        btnGuardar.textContent = "Guardar cambios";
                        form.appendChild(btnGuardar);

                        // Evento para capturar el submit del formulario
                        
                        form.addEventListener("submit", function(event) {
                            event.preventDefault(); // Evita la recarga de la página
                            
                            console.log(`boton presionado ${empleadoSeleccionadoID}`);
                            
                            
                            
                            // Actualizar el objeto tarea con los valores actuales del formulario
                            tarea.nombre = nombreInput.value;
                            tarea.descripcion = descInput.value;
                            tarea.hora = [horaInicioInput.value, horaFinInput.value];
                        
                            
                            // Llamamos a la función y mandamos la tarea actualizada
                            update(tarea, dia);
                        });
                        
                        section.appendChild(form);
                    });     

                    modalEditTask.appendChild(section);
                }
            });
        }
    })
    .catch(error => {
        console.error("Error al obtener las tareas del empleado:", error);
        alert("No se pudo cargar la información del empleado.");
    });
}

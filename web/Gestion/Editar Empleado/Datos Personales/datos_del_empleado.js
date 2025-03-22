export async function editarPersonalData() {
    console.log("Cargando datos personales...");

    if (!window.empleadoSeleccionadoID) {
        alert("Selecciona un empleado antes de editar tareas.");
        return;
    }

    // Obtener valores del formulario
    let nombre = document.getElementById("nombre_dp").value;
    let puesto = document.getElementById("puesto_dp").value;
    let username = document.getElementById("username_dp").value;
    let password = document.getElementById("password_dp").value;
    let role = document.getElementById("role_dp").value;

    // Crear objeto con todos los datos
    let data = {
        "nombre": nombre,
        "puesto": puesto,
        "username": username,
        "password": password,
        "role": role
    };

    console.log("Enviando datos:", data);

    try {
        const response = await fetch(`/empleados/${window.empleadoSeleccionadoID}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error en la solicitud:", errorData);
            alert("Error al actualizar datos.");
            return;
        }

        const resultado = await response.json();
        console.log("Empleado actualizado:", resultado);

        alert("Datos actualizados correctamente.");
        window.location.href = "/gestion";  // Redirigir después de la actualización

    } catch (error) {
        console.error("Error en la actualización:", error);
        alert("Ocurrió un error al actualizar los datos.");
    }
}

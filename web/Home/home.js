document.addEventListener("DOMContentLoaded", async function () {
    try {
        // 1) Obtener al usuario logueado (guardado en login.js)
        const loggedUserString = localStorage.getItem("loggedUser");
        if (!loggedUserString) {
            console.warn("No hay usuario logueado en localStorage");
            // window.location.href = "/login"; // Redirigir si no hay usuario
            return;
        }
        const loggedUser = JSON.parse(loggedUserString);
        console.log("loggedUser:", loggedUser);

        const welcomeMessageElem = document.getElementById("welcomeMessage");
        // Por defecto, mostramos un fallback
        welcomeMessageElem.textContent = "Bienvenido, Usuario";

        // 2) Hacemos fetch a empleados.json para obtener el nombre completo del empleado
        const response = await fetch("/empleados.json");
        if (!response.ok) throw new Error("Error al obtener empleados.json");
        const empleados = await response.json();

        // 3) Si el usuario no es administrador, buscamos su registro en empleados.json
        if (loggedUser.role !== "administrador") {
            const empleadoId = parseInt(loggedUser.empleado_id);
            console.log(`Debug empleado id ${empleadoId}`);
            const empleadosParaLaGrafica = empleados.filter(e => e.id === empleadoId);
            if (empleadosParaLaGrafica.length > 0) {
                const empleadoRecord = empleadosParaLaGrafica[0];
                // Asumimos que la propiedad que contiene el nombre es "nombre" o "username"
                welcomeMessageElem.textContent = `Bienvenido, ${empleadoRecord.nombre || empleadoRecord.username || 'Usuario'}`;
            }
        } else {
            // Si es administrador, asumimos que loggedUser tiene la propiedad "username"
            welcomeMessageElem.textContent = `Bienvenido, ${loggedUser.username || 'Administrador'}`;
        }

        // --- Resto del código para cargar empleados, tareas y animar la gráfica ---

        let empleadoId;
        let empleadosParaLaGrafica = empleados;
        if (loggedUser.role !== "administrador") {
            empleadoId = parseInt(loggedUser.empleado_id);
            console.log(`Debug empleado id ${empleadoId}`);
            empleadosParaLaGrafica = empleados.filter(e => e.id === empleadoId);
        }
        console.log(empleadosParaLaGrafica);

        // Obtener el día actual en español
        const diasSemana = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
        const hoy = diasSemana[new Date().getDay()];
        console.log(`Filtrando tareas para el día: ${hoy}`);

        let totalTareas = 0;
        let completadas = 0;
        let pendientes = 0;
        let sinIniciar = 0;

        // 4) Recorrer tareas asignadas para el día actual
        empleadosParaLaGrafica.forEach(empleado => {
            if (empleado.tareas_asignadas && empleado.tareas_asignadas[hoy]) {
                console.log("estoy dentro de");
                let tareasHoy = empleado.tareas_asignadas[hoy];
                console.log(tareasHoy);
                tareasHoy.forEach(tarea => {
                    totalTareas++;
                    switch (tarea.estatus) {
                        case 1:
                            pendientes++;
                            break;
                        case 2:
                            sinIniciar++;
                            break;
                        case 0:
                            completadas++;
                            break;
                        default:
                            console.warn(`Estatus desconocido (${tarea.estatus}) en la tarea:`, tarea);
                    }
                });
            }
        });

        // Debugging: Mostrar valores en consola
        console.log(`Total Tareas (${hoy}): ${totalTareas}`);
        console.log(`Completadas: ${completadas}`);
        console.log(`En progreso: ${pendientes}`);
        console.log(`Sin iniciar: ${sinIniciar}`);

        // Calcular porcentajes
        const porcentajeCompletadas = totalTareas > 0 ? (completadas / totalTareas) * 100 : 0;
        const porcentajePendientes = totalTareas > 0 ? (pendientes / totalTareas) * 100 : 0;
        const porcentajeSinIniciar = totalTareas > 0 ? (sinIniciar / totalTareas) * 100 : 0;

        // Perímetro del círculo
        const totalCircumference = 314;

        // Calculamos los offsets de cada categoría
        const completedOffset = totalCircumference - (porcentajeCompletadas / 100) * totalCircumference;
        const pendingOffset = completedOffset - (porcentajePendientes / 100) * totalCircumference;
        const notStartedOffset = pendingOffset - (porcentajeSinIniciar / 100) * totalCircumference;

        // Función para animar la transición de los valores
        function animateValue(element, start, end, duration) {
            let startTime = null;
            function step(timestamp) {
                if (!startTime) startTime = timestamp;
                let progress = Math.min((timestamp - startTime) / duration, 1);
                let value = Math.floor(progress * (end - start) + start);
                element.textContent = `${value}%`;
                if (progress < 1) {
                    requestAnimationFrame(step);
                }
            }
            requestAnimationFrame(step);
        }

        // Animación del porcentaje en el centro de la gráfica
        const textElement = document.querySelector(".chart-text span");
        setTimeout(() => animateValue(textElement, 0, porcentajeCompletadas, 1500), 1200);

        // Aplicar los valores animados a los círculos
        setTimeout(() => {
            document.querySelector(".progress-ring__circle.completed").style.strokeDashoffset = completedOffset;
            document.querySelector(".progress-ring__circle.pending").style.strokeDashoffset = pendingOffset;
            document.querySelector(".progress-ring__circle.not-started").style.strokeDashoffset = notStartedOffset;
        }, 1300);

        // Animación en cascada
        function showElement(selector, delay) {
            setTimeout(() => {
                document.querySelector(selector).classList.add("show");
            }, delay);
        }

        showElement("h1", 300);
        showElement(".chart-wrapper", 900);
        showElement(".guia", 1500);

        console.log(`Completadas: ${porcentajeCompletadas}% - En progreso: ${porcentajePendientes}% - Sin iniciar: ${porcentajeSinIniciar}%`);
  
    } catch (error) {
        console.error("Error cargando datos de empleados:", error);
    }
});

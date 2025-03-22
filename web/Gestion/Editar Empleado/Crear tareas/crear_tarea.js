import { enviarTarea } from './crear_tarea_enviar.js';
import {abrirModal} from '../../gestion.js'
document.addEventListener("DOMContentLoaded", function () {
  
  const menuPrincipal = document.getElementById("menu-principal");
  const btnCrearTarea = document.getElementById("btn-crear-tarea");
  const btnCrearEnviarTarea = document.getElementById("modal-edit-personal-data_btn");

  btnCrearTarea.addEventListener("click", function() {
    console.log("One day u love me again")
    abrirModal("modal-create-task"); // Mostramos el modal
  });
  btnCrearEnviarTarea.addEventListener("click", function(){
    enviarTarea();
  })
});
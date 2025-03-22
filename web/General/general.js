document.addEventListener ('DOMContentLoaded', () =>{
    const menuContainer = document.getElementById('menu-container');
    menuContainer.innerHTML = ''; // Limpiar contenido previo
    menuContainer.appendChild(tabContainer);
});
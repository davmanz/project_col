document.addEventListener('DOMContentLoaded', function() {

    objectDom = {
        name : document.getElementById('name'),
        last_name : document.getElementById('last_name'),
        id_number : document.getElementById('id-number'),
        email : document.getElementById('email'),
        password : document.getElementById('password'),
        docNum : document.getElementById('docNum')
    };

    // Función que se llama cuando se hace clic en el botón de búsqueda
    function handleSearchClick() {
        const documentNumbervalue = objectDom.documentNumberInput.value.trim();
    };

});
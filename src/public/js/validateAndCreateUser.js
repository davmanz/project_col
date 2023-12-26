document.getElementById("user-form").addEventListener("submit", function(event) {
    let isValid = true;

    // Validar Nombres
    const name = document.getElementById("name").value;
    if (!name.trim()) {
        document.getElementById("name-error").textContent = "Por favor, ingrese su nombre.";
        isValid = false;
    } else {
        document.getElementById("name-error").textContent = "";
    }

    // Validar Apellidos
    const lastName = document.getElementById("last_name").value;
    if (!lastName.trim()) {
        document.getElementById("last-name-error").textContent = "Por favor, ingrese sus apellidos.";
        isValid = false;
    } else {
        document.getElementById("last-name-error").textContent = "";
    }

    // Validar Tipo de Identificación
    const idType = document.getElementById("id-type").value;
    if (!idType) {
        document.getElementById("id-type-error").textContent = "Por favor, seleccione un tipo de identificación.";
        isValid = false;
    } else {
        document.getElementById("id-type-error").textContent = "";
    }

    // Validar Número de Identificación
    const idNumber = document.getElementById("id-number").value;
    if (!idNumber.trim()) {
        document.getElementById("id-number-error").textContent = "Por favor, ingrese su número de identificación.";
        isValid = false;
    } else {
        document.getElementById("id-number-error").textContent = "";
    }

    // Validar Correo Electrónico
    const email = document.getElementById("email").value;
    if (!/\S+@\S+\.\S+/.test(email)) {
        document.getElementById("email-error").textContent = "El correo electrónico es inválido.";
        isValid = false;
    } else {
        document.getElementById("email-error").textContent = "";
    }

    // Validar Contraseña
    const password = document.getElementById("password").value;
    if (password.length < 8) {
        document.getElementById("password-error").textContent = "La contraseña debe tener al menos 8 caracteres.";
        isValid = false;
    } else {
        document.getElementById("password-error").textContent = "";
    }

    // Validar Foto Personal (opcional)
    const photo = document.getElementById("photo").files.length;
    if (photo === 0) {
        document.getElementById("photo-error").textContent = "Por favor, cargue una foto personal.";
        isValid = false;
    } else {
        document.getElementById("photo-error").textContent = "";
    }

    // Prevenir el envío del formulario si hay errores
    if (!isValid) {
        event.preventDefault();
    }
});
document.addEventListener('DOMContentLoaded', function() {
    objectDom = {
        searchButton : document.getElementById('btn-search'),
        documentNumberInput : document.getElementById('serchDocumentNumber'),
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

        fetch(`/fdocmod/${documentNumbervalue}`)
            .then(response => response.json())
            .then(data => {
            if (data.success) {
                const userInfo = data.data;
                objectDom.name.value = `${userInfo.first_name}`;
                objectDom.last_name.value = `${userInfo.last_name}`;
                objectDom.id_number.value = documentNumbervalue;
                objectDom.docNum.value = documentNumbervalue
                objectDom.email.value = `${userInfo.email}`;
                // Habilita los campos para llenar los datos del contrato
                objectDom.searchButton.disabled = true;
                objectDom.documentNumberInput.disabled = true;
            } else {
                console.log("ALERTA");
            }
            })
            .catch(error => {
                // Asegúrate de que userInfoDisplay esté definido en tu HTML
                console.error('Error:', error);
            });
    };

    objectDom.searchButton.addEventListener('click', handleSearchClick);
});
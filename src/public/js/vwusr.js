document.addEventListener('DOMContentLoaded', function() {

    objectDom = {
        searchDocNumber: document.getElementById('serchDocumentNumber'),
        searchButton : document.getElementById('btnSerch'),
        nameForm : document.getElementById('name'),
        lastNameForm : document.getElementById('lastName'),
        emailForm : document.getElementById('email'),
        textForm : document.getElementById('values'),
        btnEdit : document.getElementById('editData'),
        btnDel : document.getElementById('deleteData')
    };

    // Función que se llama cuando se hace clic en el botón de búsqueda
    function handleSearchClick() {

        const documentNumbervalue = objectDom.searchDocNumber.value.trim();

        fetch(`/vwusr/${documentNumbervalue}`)
            .then(response => response.json())
            .then(data => {
            if (data.success) {
                objectDom.searchDocNumber.readOnly = true;
                objectDom.searchButton.disabled = true;
                objectDom.btnEdit.disabled = false;
                objectDom.btnDel.disabled = false;

                const userInfo = data.data[0];
                objectDom.nameForm.value = userInfo.first_name ;
                objectDom.lastNameForm.value = userInfo.last_name;
                objectDom.emailForm.value = userInfo.email;
                objectDom.textForm.value = userInfo.contract_ids.replace(/,/g, '\n');
            } else {
                console.log("ALERTA");
            }
            })
            .catch(error => {
                // Asegúrate de que userInfoDisplay esté definido en tu HTML
                console.error('Error:', error);
            });
    };

    function clickEdit() {
        console.log("clickEdit llamado");
        const documentNumbervalue = objectDom.searchDocNumber.value.trim();
    
        fetch(`/vwusr/edit/${documentNumbervalue}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Usa la URL proporcionada por el servidor para redirigir
                window.location.href = data.redirectUrl;
            } else {
                // Manejar la situación en la que el documento no se encuentra
                console.error('Documento no encontrado o error en el servidor.');
            }
        })
        .catch(error => {
            console.error('Hubo un problema con la solicitud fetch:', error);
        });
    }
    
    objectDom.searchButton.addEventListener('click', handleSearchClick);
    objectDom.btnEdit.addEventListener('click', clickEdit);
    objectDom.btnDel.addEventListener('click');
});
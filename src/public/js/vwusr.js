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

    function clickEdit(){
        const documentNumbervalue = objectDom.searchDocNumber.value.trim();

        fetch(`/vwusr/edit/:${documentNumbervalue}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Añade aquí otros encabezados si son necesarios
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Respuesta de red no fue ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Respuesta del servidor:', data);
            // Redirigir a /mod_usr en caso de éxito
            window.location.href = '/mod_usr';
        })
        .catch(error => {
            console.error('Hubo un problema con la solicitud fetch:', error);
        });

    }

    objectDom.searchButton.addEventListener('click', handleSearchClick);
    objectDom.btnEdit.addEventListener('click', clickEdit);
    objectDom.btnDel.addEventListener('click');
});
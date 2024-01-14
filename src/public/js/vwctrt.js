document.addEventListener('DOMContentLoaded', function() {

    objectDom = {
        serchContract: document.getElementById('serchContract'),
        btnSerch : document.getElementById('btnSerch'),
        nameForm : document.getElementById('name'),
        startDate : document.getElementById('start_date'),
        endDate : document.getElementById('end_date'),
        paymentDay : document.getElementById('payment_day'),
        rentAmount : document.getElementById('rent_amount'),
        hasWifi : document.getElementById('has_wifi'),
        wifiCost : document.getElementById('wifi_cost'),
        roomNumber : document.getElementById('room_number'),
        vwContract : document.getElementById('vwContract'),
        btnEdit : document.getElementById('editData'),
        btnDel : document.getElementById('deleteData'),
        inputPswd : document.getElementById('pswd')
    };

    // Función que se llama cuando se hace clic en el botón de búsqueda
    function handleSearchClick() {

        const serchContractvalue = objectDom.serchContract.value.trim();

        fetch(`/vwusr/${serchContractvalue}`)
            .then(response => response.json())
            .then(data => {
            if (data.success) {
                objectDom.serchContract.readOnly = true;
                objectDom.btnSerch.disabled = true;
                objectDom.btnEdit.disabled = false;
                objectDom.btnDel.disabled = false;

                const userInfo = data.data[0];
                objectDom.inputPswd.value = userInfo.user_id;
                objectDom.nameForm.value = userInfo.first_name ;
                objectDom.lastNameForm.value = userInfo.last_name;
                objectDom.emailForm.value = userInfo.email;
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
    };
    
    function clickDelete() {
        const idNumbervalue = objectDom.inputPswd.value.trim();

        fetch('/deleteuser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: idNumbervalue })
        })
        .then(response => {
            if (response.ok) {
                console.log('Usuario eliminado');
                window.location.href = '/index'; // Redirigir al usuario
            } else {
                throw new Error('Error al eliminar el usuario');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };

    objectDom.searchButton.addEventListener('click', handleSearchClick);
    objectDom.btnEdit.addEventListener('click', clickEdit);
    objectDom.btnDel.addEventListener('click', clickDelete);
});
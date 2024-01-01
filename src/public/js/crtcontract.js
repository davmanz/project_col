document.addEventListener('DOMContentLoaded', function() {
  objectDom = {
    searchButton : document.getElementById('btn-search'),
    selectWifi : document.getElementById('has_wifi'),
    costWifi : document.getElementById('wifi_cost'),
    dateStart : document.getElementById('start_date'),
    dateEnd : document.getElementById('end_date'),
    paymentDay : document.getElementById('payment_day'),
    rentAmount : document.getElementById('rent_amount'),
    warranty : document.getElementById('warranty'),
    contractPhoto : document.getElementById('contract_photo'),
    btnReset : document.getElementById('btn-reset'),
    roomNumber : document.getElementById('room_number'),
    userName : document.getElementById('user_name'),
    documentNumber : document.getElementById('document_number'),
    documentNumberInput : document.getElementById('serchDocumentNumber') // Agregado al objeto
  };

  // Función que se llama cuando se hace clic en el botón de búsqueda
  function handleSearchClick() {
    const documentNumbervalue = objectDom.documentNumberInput.value.trim();

    fetch(`/fdoc/${documentNumbervalue}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const userInfo = data.data;
          objectDom.userName.value = `${userInfo.first_name} ${userInfo.last_name}`;
          objectDom.documentNumber.value = documentNumbervalue;

          // Habilita los campos para llenar los datos del contrato
          objectDom.documentNumberInput.disabled = true;
          objectDom.userName.disabled = true;
          objectDom.searchButton.disabled = true;
          objectDom.dateStart.disabled = false;
          objectDom.dateEnd.disabled = false;
          objectDom.paymentDay.disabled = false;
          objectDom.rentAmount.disabled = false;
          objectDom.warranty.disabled = false;
          objectDom.selectWifi.disabled = false;
          objectDom.contractPhoto.disabled = false;
          objectDom.btnReset.disabled = false;
          objectDom.roomNumber.disabled = false;
        } else {
          console.log("ALERTA");
        }
      })
      .catch(error => {
        // Asegúrate de que userInfoDisplay esté definido en tu HTML
        userInfoDisplay.textContent = 'Ocurrió un error al realizar la búsqueda.';
        console.error('Error:', error);
      });
  };

  function change_select_wifi() {
    if (objectDom.selectWifi.value == '1'){
      objectDom.costWifi.disabled = false;
    } else {
      objectDom.costWifi.value = '';
      objectDom.costWifi.disabled = true;
    }
  }

  objectDom.selectWifi.addEventListener('change', change_select_wifi);
  objectDom.searchButton.addEventListener('click', handleSearchClick);
});

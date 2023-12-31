document.addEventListener('DOMContentLoaded', function() {

  // Selecciona el botón de búsqueda por su ID
  const searchButton = document.getElementById('btn-search');

  // Función que se llama cuando se hace clic en el botón de búsqueda
  function handleSearchClick() {

    // Limpia previos mensajes de error
      const documentNumberInput = document.getElementById('document-number');
    const documentNumber = documentNumberInput.value.trim();

    // Realiza la petición GET al servidor
    fetch(`/fdoc/${documentNumber}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const userInfo = data.data;
          id_client = data.user_id;

          // Actualiza los campos de entrada con la información del usuario
          document.getElementById('user-name').value = `${userInfo.first_name} ${userInfo.last_name}`;

          // Habilita los campos para llenar los datos del contrato
          documentNumberInput.disabled = true;
          document.getElementById('user-name').disabled = true;
          searchButton.disabled = true;
          document.getElementById('start-date').disabled = false;
          document.getElementById('end-date').disabled = false;
          document.getElementById('payment-day').disabled = false;
          document.getElementById('rent-amount').disabled = false;
          document.getElementById('warranty').disabled = false;
          document.getElementById('has-wifi').disabled = false;
          document.getElementById('contract-photo').disabled = false;
          document.getElementById('btn-reset').disabled = false;
        } else {
          console.log("ALERTA")
        }
      })
      .catch(error => {
        userInfoDisplay.textContent = 'Ocurrió un error al realizar la búsqueda.';
        console.error('Error:', error);
      });
  }

  // Añade un listener al botón de búsqueda para llamar a la función handleSearchClick cuando se haga clic
  searchButton.addEventListener('click', handleSearchClick);
});

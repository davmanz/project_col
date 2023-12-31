document.addEventListener('DOMContentLoaded', function() {
  // Selecciona el botón de búsqueda por su ID
  const searchButton = document.getElementsById('btn-search');
  console.log('ALERTA');

  // Función que se llama cuando se hace clic en el botón de búsqueda
  function handleSearchClick() {
    console.log('ALERTA');
    const documentNumberInput = document.getElementById('document-number');
    const documentNumber = documentNumberInput.value;

    // Realiza la petición GET al servidor
    fetch(`/fdoc/${documentNumber}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const userInfo = data.data;

          // Actualiza los campos de entrada con la información del usuario
          document.getElementById('user-name').value = `${userInfo.nombre} ${userInfo.apellido}`;

          // Habilita los campos para llenar los datos del contrato
          document.getElementById('start-date').disabled = false;
          document.getElementById('end-date').disabled = false;
          document.getElementById('payment-day').disabled = false;
          document.getElementById('rent-amount').disabled = false;
          document.getElementById('warranty').disabled = false;
          document.getElementById('has-wifi').disabled = false;
          document.getElementById('wifi-cost').disabled = false;
          document.getElementById('contract-photo').disabled = false;
          document.querySelector('button[type="submit"]').disabled = false;

        } else {
          alert('Documento no encontrado.');
          // Aquí podrías manejar lo que sucede si no se encuentra el documento
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  // Añade un listener al botón de búsqueda para llamar a la función handleSearchClick cuando se haga clic
  searchButton.addEventListener('click', handleSearchClick);
});

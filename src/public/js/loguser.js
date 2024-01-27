document.addEventListener('DOMContentLoaded', (event) => {

    const selectElement = document.getElementById('select_ctr');    
    selectElement.addEventListener('change', (event) => {
        const selectedValue = event.target.value;
        // Llama a tu función aquí, por ejemplo:
        handleSelectChange(selectedValue);
    });

});

function handleSelectChange(value) {

    fetch(`/vwctrt/${value}`)
    .then(response => response.json())
    .then(info => {
        if(info.success){
            document.getElementById('contract_number').textContent = info.data.contract_id;
            document.getElementById('contract_status').textContent = info.data.active === 1 ? 'Vigente' : 'Vencido';
            document.getElementById('payment_date').textContent = (() => {
                const fechaCompleta = info.data.contract_start_date;
                const partesFecha = fechaCompleta.split(/, |\/| /); // Divide por coma y espacio, o barra, o espacio
                return partesFecha[1]; // Retorna el día, que es el tercer elemento en el array
            })();
            document.getElementById('due_date').textContent = info.data.contract_end_date;
            document.getElementById('wifi_status').textContent = info.data.has_wifi === 1 ? 'Activo' : 'Inactivo';
            document.getElementById('wifi_coste').textContent = info.data.wifi_cost !== null ? info.data.wifi_cost : 'N/A' ;
1        }else(
            alert(info.message)
        );
      
      // ... otros elementos ...
    })
    .catch(error => console.error('Error:', error));
}
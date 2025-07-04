// Función para cargar pedidos en la tabla
const cargarPedidos = async () => {
  const pedidosTableBody = document.getElementById('pedidosTableBody');
  pedidosTableBody.innerHTML = '';
  try {
    const token = getToken();
    const config = {
      headers: { 'Authorization': `Bearer ${token}` }
    };
    const response = await axios.get('http://127.0.0.1:4000/api/pedidos', config);
    const pedidos = response.data;

    pedidos.forEach(pedido => {
      const row = pedidosTableBody.insertRow();
      const fecha = new Date(pedido.fecha).toLocaleString();
      row.innerHTML = `
        <td>${pedido.id}</td>
        <td>${fecha}</td>
        <td>${pedido.usuario?.nombre || 'N/A'}</td>
        <td>
          <select class="form-select form-select-sm estado-pedido" data-id="${pedido.id}">
            <option value="pendiente" ${pedido.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
            <option value="en_proceso" ${pedido.estado === 'en_proceso' ? 'selected' : ''}>En Proceso</option>
            <option value="completado" ${pedido.estado === 'completado' ? 'selected' : ''}>Completado</option>
            <option value="cancelado" ${pedido.estado === 'cancelado' ? 'selected' : ''}>Cancelado</option>
          </select>
        </td>
        <td>${pedido.tipoEntrega || 'N/A'}</td>
        <td>
          <button class="btn btn-info btn-sm ver-detalles" data-id="${pedido.id}">
            <i class="bi bi-eye"></i> Ver Detalles
          </button>
        </td>
      `;
    });

    // Agregar event listeners para los cambios de estado
    document.querySelectorAll('.estado-pedido').forEach(select => {
      select.addEventListener('change', async (e) => {
        const pedidoId = e.target.dataset.id;
        const nuevoEstado = e.target.value;
        try {
          const token = getToken();
          const config = {
            headers: { 'Authorization': `Bearer ${token}` }
          };
          await axios.put(`http://127.0.0.1:4000/api/pedidos/${pedidoId}/estado`, 
            { estado: nuevoEstado }, 
            config
          );
          showNotificationModal('Estado del pedido actualizado exitosamente', 'success');
        } catch (error) {
          console.error('Error al actualizar estado:', error);
          showNotificationModal('Error al actualizar el estado del pedido', 'danger');
          // Revertir el select al estado anterior
          e.target.value = pedido.estado;
        }
      });
    });

    // Agregar event listeners para ver detalles
    document.querySelectorAll('.ver-detalles').forEach(button => {
      button.addEventListener('click', async (e) => {
        const pedidoId = e.target.closest('.ver-detalles').dataset.id;
        try {
          const token = getToken();
          const config = {
            headers: { 'Authorization': `Bearer ${token}` }
          };
          const response = await axios.get(`http://127.0.0.1:4000/api/pedidos/${pedidoId}`, config);
          const pedido = response.data;
          
          // Mostrar detalles en el modal de notificación
          const detallesHTML = `
            <h5>Detalles del Pedido ${pedido.id}</h5>
            <p><strong>Cliente:</strong> ${pedido.usuario?.nombre || 'N/A'}</p>
            <p><strong>Fecha:</strong> ${new Date(pedido.fecha).toLocaleString()}</p>
            <p><strong>Estado:</strong> ${pedido.estado}</p>
            <p><strong>Tipo de Entrega:</strong> ${pedido.tipoEntrega || 'N/A'}</p>
            <h6>Productos:</h6>
            <ul>
              ${pedido.items.map(item => `
                <li>${item.nombre} - Cantidad: ${item.cantidad} - Precio: $${item.precio}</li>
              `).join('')}
            </ul>
          `;
          notificationModalBody.innerHTML = detallesHTML;
          notificationModalLabel.textContent = 'Detalles del Pedido';
          notificationModalHeader.classList.remove('bg-success', 'bg-danger', 'bg-warning');
          notificationModalHeader.classList.add('bg-info');
          notificationModal.show();
        } catch (error) {
          console.error('Error al obtener detalles:', error);
          showNotificationModal('Error al cargar los detalles del pedido', 'danger');
        }
      });
    });
  } catch (error) {
    console.error('Error al cargar pedidos:', error);
    showNotificationModal('Error al cargar los pedidos', 'danger');
  }
}; 
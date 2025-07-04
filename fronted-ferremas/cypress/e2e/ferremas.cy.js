describe('Flujo completo de compra UI + Webpay - Usuario Luis Arenas', () => {
  const correo = 'luis.arenas@duocuc.cl';
  const password = 'Knotfest.11';
  const productoNombre = 'Lijadora orbital eléctrica 200W';
  const tarjeta = '4051884239937763';
  const rut = '11111111-1';
  const clave = '123';

  it('Login, catálogo, agrega HE0001, verifica carrito, compra, paga y muestra resumen', () => {
    // 1. Login en cliente.html
    cy.visit('/cliente.html');
    cy.wait(1000);
    cy.get('#btnLoginNav').click();
    cy.get('#loginForm').within(() => {
      cy.get('#correo').focus().clear().invoke('val', correo).trigger('input');
      cy.get('#password').focus().clear().invoke('val', password).trigger('input');
      cy.root().submit();
    });
    cy.get('.toast-body').should('contain', 'Sesi');
    cy.url().should('include', 'cliente.html');

    // 2. Ir al catálogo (index.html#catalogo)
    cy.visit('/index.html#catalogo');
    cy.get('#productosContainer', { timeout: 10000 }).should('exist');
    cy.wait(1000);

    // 3. Buscar y agregar el producto HE0001 (por nombre)
    cy.get('#productosContainer .product-card').contains(productoNombre).parents('.product-card').within(() => {
      cy.get('[data-cy="add-to-cart-button"]').click();
    });
    cy.get('.toast-body').should('contain', 'agregado');

    // 4. Abrir el carrito usando el botón correcto
    cy.get('#btnVerCarritoNav').click();
    cy.get('#carritoModal').should('be.visible');
    cy.get('#carritoLista').should('contain', productoNombre);
    cy.wait(500);

    // 5. Finalizar la compra usando el botón correcto
    cy.get('#btnFinalizarCompra').click();

    // 6. Confirmar compra en el resumen
    cy.get('button').contains('Confirmar Compra').click();

    // 7. Elegir retiro en local usando el botón real
    cy.get('#btnRetiroLocal').click();

    // 8. Esperar la redirección a Webpay antes de usar cy.origin
    cy.url({ timeout: 20000 }).should('include', 'webpay3gint.transbank.cl');

    cy.origin('https://webpay3gint.transbank.cl', () => {
      cy.log('Esperando botón Tarjetas');
      cy.get('button#tarjetas', { timeout: 30000 })
        .should('be.visible')
        .trigger('mousedown')
        .trigger('mouseup')
        .click({ force: true });
      cy.log('Click en botón Tarjetas realizado');
      // 2. Ingresar número de tarjeta
      cy.get('input#card-number').type('4051884239937763');
      // 3. Click en "Continuar"
      cy.get('button.submit').contains('Continuar').click();
      // 4. Click en "Pagar"
      cy.get('button.submit').contains('Pagar').click();
      // 5. Autenticación bancaria
      cy.get('input#rutClient', { timeout: 20000 }).type('11111111-1');
      cy.get('input#passwordClient').type('123');
      cy.get('input[type="submit"][value="Aceptar"]').click();
      // 6. Continuar si aparece
      cy.get('input[type="submit"][value="Continuar"]', { timeout: 10000 }).click();
    });

    // 9. Verificar resumen de compra
    cy.url({timeout: 20000}).should('include', 'pago_exitoso.html');
    cy.get('#resumenPedido, #resumen-compra, .resumen-compra').should('exist');
    cy.contains('Resumen').should('exist');
    cy.contains('retiro').should('exist');
    cy.contains(productoNombre);
  });
});
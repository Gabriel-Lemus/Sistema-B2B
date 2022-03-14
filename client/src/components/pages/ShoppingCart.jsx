import React from 'react';
import DashboardTemplate from '../templates/DashboardTemplate';
import helpers from '../../helpers/helpers';
import ShoppingCartForm from '../organisms/ShoppingCartForm';

function ShoppingCart() {
  return (
    <DashboardTemplate
      displaySearchBar={false}
      sideBarItems={helpers.CLIENT_PAGES}
      pageTitle="Carrito de Compras"
    >
      <ShoppingCartForm />
    </DashboardTemplate>
  );
}

export default ShoppingCart;

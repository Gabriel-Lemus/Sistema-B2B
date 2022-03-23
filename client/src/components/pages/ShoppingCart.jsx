import React, { useEffect } from 'react';
import DashboardTemplate from '../templates/DashboardTemplate';
import helpers from '../../helpers/helpers';
import ShoppingCartForm from '../organisms/ShoppingCartForm';

function ShoppingCart() {
  // Effects
  useEffect(() => {
    document.title = 'Carrito de Compras';
  }, []);

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

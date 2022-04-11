import React, { useEffect, useState } from 'react';
import DashboardTemplate from '../templates/DashboardTemplate';
import helpers from '../../helpers/helpers';
import ShoppingCartForm from '../organisms/ShoppingCartForm';
import Loader from '../molecules/Loader';

function ShoppingCart() {
  // State
  const [loading, setLoading] = useState(true);

  // Effects
  useEffect(() => {
    document.title = 'Carrito de Compras';
  }, []);

  return (
    <>
      <DashboardTemplate
        displaySearchBar={false}
        sideBarItems={helpers.CLIENT_PAGES}
        pageTitle="Carrito de Compras"
      >
        <ShoppingCartForm setLoading={setLoading} />
      </DashboardTemplate>
      {loading ? <Loader loading={loading} /> : <></>}
    </>
  );
}

export default ShoppingCart;

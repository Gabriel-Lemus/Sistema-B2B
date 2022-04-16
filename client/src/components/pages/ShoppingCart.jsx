import React, { useEffect, useState } from 'react';
import DashboardTemplate from '../templates/DashboardTemplate';
import helpers from '../../helpers/helpers';
import ShoppingCartForm from '../organisms/ShoppingCartForm';
import Loader from '../molecules/Loader';

function ShoppingCart() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Carrito de Compras';
  }, []);

  return (
    <>
      <DashboardTemplate
        displaySearchBar={false}
        sideBarItems={
          localStorage.getItem('userType') !== 'distribuidor'
            ? helpers.CLIENT_PAGES
            : helpers.CLIENT_PAGES.concat(helpers.DISTRIBUTOR_CLIENTS_PAGES)
        }
        pageTitle="Carrito de Compras"
      >
        <ShoppingCartForm setLoading={setLoading} />
      </DashboardTemplate>
      {loading ? <Loader loading={loading} /> : <></>}
    </>
  );
}

export default ShoppingCart;


import React, { useEffect, useState } from 'react';
import DashboardTemplate from '../templates/DashboardTemplate';
import helpers from '../../helpers/helpers';
import OrdersToFactoriesForm from '../organisms/OrdersToFactoriesForm';
import Loader from '../molecules/Loader';

function OrderToFactories() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Órdenes';
  }, []);

  return (
    <>
      <DashboardTemplate
        displaySearchBar={false}
        sideBarItems={helpers.SELLER_PAGES}
        pageTitle="Órdenes"
      >
        <OrdersToFactoriesForm setLoading={setLoading} />
      </DashboardTemplate>
      {loading ? <Loader loading={loading} /> : <></>}
    </>
  );
}

export default OrderToFactories;

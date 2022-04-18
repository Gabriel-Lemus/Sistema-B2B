import React, { useEffect, useState } from 'react';
import DashboardTemplate from '../templates/DashboardTemplate';
import helpers from '../../helpers/helpers';
import OrdersForm from '../organisms/OrdersForm';
import Loader from '../molecules/Loader';

function Orders() {
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
        <OrdersForm setLoading={setLoading} />
      </DashboardTemplate>
      {loading ? <Loader loading={loading} /> : <></>}
    </>
  );
}

export default Orders;

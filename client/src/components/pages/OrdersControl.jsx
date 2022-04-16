import React, { useEffect, useState } from 'react';
import DashboardTemplate from '../templates/DashboardTemplate';
import helpers from '../../helpers/helpers';
import OrdersControlForm from '../organisms/OrdersControlForm';
import Loader from '../molecules/Loader';

function Orders() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Control de órdenes';
  }, []);

  return (
    <>
      <DashboardTemplate
        displaySearchBar={false}
        sideBarItems={helpers.CLIENT_PAGES}
        pageTitle="Control de órdenes"
      >
        <OrdersControlForm setLoading={setLoading} />
      </DashboardTemplate>
      {loading ? <Loader loading={loading} /> : <></>}
    </>
  );
}

export default Orders;


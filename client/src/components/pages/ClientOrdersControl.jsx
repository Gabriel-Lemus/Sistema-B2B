import React, { useEffect, useState } from 'react';
import DashboardTemplate from '../templates/DashboardTemplate';
import helpers from '../../helpers/helpers';
import ClientOrdersControlForm from '../organisms/ClientOrdersControlForm';
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
        sideBarItems={
          localStorage.getItem('userType') !== 'distribuidor'
            ? helpers.CLIENT_PAGES
            : helpers.CLIENT_PAGES.concat(helpers.DISTRIBUTOR_CLIENTS_PAGES)
        }
        pageTitle="Control de órdenes"
      >
        <ClientOrdersControlForm setLoading={setLoading} />
      </DashboardTemplate>
      {loading ? <Loader loading={loading} /> : <></>}
    </>
  );
}

export default Orders;


import React, { useEffect, useState } from 'react';
import DashboardTemplate from '../templates/DashboardTemplate';
import helpers from '../../helpers/helpers';
import Loader from '../molecules/Loader';
import FactoryOrdersList from '../organisms/FactoryOrdersList';

function FactoryOrders() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Órdenes por entregar';
  }, []);

  return (
    <>
      <DashboardTemplate
        displaySearchBar={false}
        sideBarItems={
          localStorage.getItem('userType') === 'fabricante'
            ? helpers.FACTORY_PAGES
            : helpers.SELLER_PAGES
        }
        pageTitle="Órdenes por entregar"
      >
        <FactoryOrdersList loading={loading} setLoading={setLoading} />
      </DashboardTemplate>
      {loading ? <Loader loading={loading} /> : <></>}
    </>
  );
}

export default FactoryOrders;

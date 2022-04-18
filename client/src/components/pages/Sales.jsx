import React, { useState, useEffect } from 'react';
import helpers from '../../helpers/helpers';
import Loader from '../molecules/Loader';
import SalesList from '../organisms/SalesList';
import DashboardTemplate from '../templates/DashboardTemplate';

function DevicesCatalog() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Compras';
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
        pageTitle="Compras"
      >
        <SalesList loading={loading} setLoading={setLoading} />
      </DashboardTemplate>
      {loading ? <Loader loading={loading} /> : <></>}
    </>
  );
}

export default DevicesCatalog;


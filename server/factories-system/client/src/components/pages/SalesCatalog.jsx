import React, { useState } from 'react';
import DashboardTemplate from '../templates/DashboardTemplate';
import SalesCatalogForm from '../organisms/SalesCatalogForm';
import Loader from '../molecules/Loader';
import helpers from '../../helpers/helpers';

function SalesCatalog() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <DashboardTemplate
        displaySearchBar={false}
        sideBarItems={
          localStorage.getItem('userType') === 'fabricante'
            ? helpers.FACTORY_PAGES
            : helpers.SELLER_PAGES
        }
        pageTitle="Catálogo de Ventas"
      >
        <SalesCatalogForm loading={loading} setLoading={setLoading} />
      </DashboardTemplate>
      {loading ? <Loader loading={loading} /> : <></>}
    </>
  );
}

export default SalesCatalog;

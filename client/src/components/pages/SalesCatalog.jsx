import React, { useState } from 'react';
import DashboardTemplate from '../templates/DashboardTemplate';
import SalesCatalogForm from '../organisms/SalesCatalogForm';
import Loader from '../molecules/Loader';

function SalesCatalog() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <DashboardTemplate
        displaySearchBar={false}
        sideBarItems={[]}
        pageTitle="Catálogo de Ventas"
      >
        <SalesCatalogForm loading={loading} setLoading={setLoading} />
      </DashboardTemplate>
      {loading ? <Loader loading={loading} /> : <></>}
    </>
  );
}

export default SalesCatalog;

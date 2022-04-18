import React, { useState } from 'react';
import helpers from '../../helpers/helpers';
import DashboardTemplate from '../templates/DashboardTemplate';
import Loader from '../molecules/Loader';

function DevicesCatalogSearchWait() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <DashboardTemplate
        displaySearchBar={true}
        sideBarItems={helpers.SELLER_PAGES}
        pageTitle="Catálogo de dispositivos"
      />
      {loading ? <Loader loading={loading} /> : <></>}
    </>
  );
}

export default DevicesCatalogSearchWait;


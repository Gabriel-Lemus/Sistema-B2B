import React, { useState } from 'react';
import helpers from '../../helpers/helpers';
import FactoryDashboardTemplate from '../templates/FactoryDashboardTemplate';
import Loader from '../molecules/Loader';

function DevicesCatalogSearchWait() {
  const [loading, _setLoading] = useState(true);

  return (
    <>
      <FactoryDashboardTemplate
        displaySearchBar={true}
        sideBarItems={helpers.SELLER_PAGES}
        pageTitle="Catálogo de dispositivos"
      />
      {loading ? <Loader loading={loading} /> : <></>}
    </>
  );
}

export default DevicesCatalogSearchWait;


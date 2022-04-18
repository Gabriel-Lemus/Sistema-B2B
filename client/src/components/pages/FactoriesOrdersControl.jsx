import React, { useEffect, useState } from 'react';
import DashboardTemplate from '../templates/DashboardTemplate';
import helpers from '../../helpers/helpers';
import FactoriesOrdersForm from '../organisms/FactoriesOrdersForm';
import Loader from '../molecules/Loader';

function FactoriesOrdersControl() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Control de órdenes';
  }, []);

  return (
    <>
      <DashboardTemplate
        displaySearchBar={false}
        sideBarItems={helpers.SELLER_PAGES}
        pageTitle="Control de órdenes"
      >
        <FactoriesOrdersForm setLoading={setLoading} />
      </DashboardTemplate>
      {loading ? <Loader loading={loading} /> : <></>}
    </>
  );
}

export default FactoriesOrdersControl;


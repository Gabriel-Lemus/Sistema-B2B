import React, { useEffect, useState } from 'react';
import helpers from '../../helpers/helpers';
import Loader from '../molecules/Loader';
import FactorySpecializedSearchForm from '../organisms/FactorySpecializedSearchForm';
import FactoryDashboardTemplate from '../templates/FactoryDashboardTemplate';

function SpecializedSearch() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Búsqueda Especializada';
  }, []);

  return (
    <>
      <FactoryDashboardTemplate
        displaySearchBar={true}
        sideBarItems={helpers.SELLER_PAGES}
        pageTitle="Búsqueda Especializada"
      >
        <FactorySpecializedSearchForm loading={loading} setLoading={setLoading} />
      </FactoryDashboardTemplate>
      {loading ? <Loader loading={loading} /> : <></>}
    </>
  );
}

export default SpecializedSearch;

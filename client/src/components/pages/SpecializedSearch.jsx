import React, { useEffect, useState } from 'react';
import helpers from '../../helpers/helpers';
import Loader from '../molecules/Loader';
import SpecializedSearchForm from '../organisms/SpecializedSearchForm';
import DashboardTemplate from '../templates/DashboardTemplate';

function SpecializedSearch() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Búsqueda Especializada';
  }, []);

  return (
    <>
      <DashboardTemplate
        displaySearchBar={true}
        sideBarItems={
          localStorage.getItem('userType') !== 'distribuidor'
            ? helpers.CLIENT_PAGES
            : helpers.CLIENT_PAGES.concat(helpers.DISTRIBUTOR_CLIENTS_PAGES)
        }
        pageTitle="Búsqueda Especializada"
      >
        <SpecializedSearchForm loading={loading} setLoading={setLoading} />
      </DashboardTemplate>
      {loading ? <Loader loading={loading} /> : <></>}
    </>
  );
}

export default SpecializedSearch;


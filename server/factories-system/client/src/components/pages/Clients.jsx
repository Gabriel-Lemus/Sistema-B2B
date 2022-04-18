import React, { useEffect, useState } from 'react';
import DashboardTemplate from '../templates/DashboardTemplate';
import helpers from '../../helpers/helpers';
import Loader from '../molecules/Loader';
import ClientsList from '../organisms/ClientsList';

function Clients() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Clientes';
  }, []);

  return (
    <>
      <DashboardTemplate
        displaySearchBar={false}
        sideBarItems={
          localStorage.getItem('userType') === 'fabricante'
            ? helpers.getFactoryPages(localStorage.getItem('id'))
            : helpers.SELLER_PAGES
        }
        pageTitle="Listado de Clientes"
      >
        <ClientsList loading={loading} setLoading={setLoading} />
      </DashboardTemplate>
      {loading ? <Loader loading={loading} /> : <></>}
    </>
  );
}

export default Clients;

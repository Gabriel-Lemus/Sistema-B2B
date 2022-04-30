import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardTemplate from '../templates/DashboardTemplate';
import helpers from '../../helpers/helpers';
import Loader from '../molecules/Loader';
import SalesReportsForm from '../organisms/SalesReportsForm';

function DeviceData() {
  let { id } = useParams();
  const [loading, setLoading] = useState(true);

  return (
    <>
      <DashboardTemplate
        displaySearchBar={false}
        sideBarItems={
          localStorage.getItem('userType') === 'fabricante'
            ? helpers.getFactoryPages(localStorage.getItem('id'))
            : helpers.SELLER_PAGES
        }
        pageTitle="Reporte de ventas"
      >
        <SalesReportsForm
          sellerId={id}
          loading={loading}
          setLoading={setLoading}
        />
      </DashboardTemplate>
      {loading ? <Loader loading={loading} /> : <></>}
    </>
  );
}

export default DeviceData;


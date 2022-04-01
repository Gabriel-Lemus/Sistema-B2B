import React, { useState } from 'react';
import DashboardTemplate from '../templates/DashboardTemplate';
import Loader from '../molecules/Loader';
import helpers from '../../helpers/helpers';
import SellerSalesList from '../organisms/SellerSalesList';

function SellersSales() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <DashboardTemplate
        displaySearchBar={false}
        sideBarItems={
          localStorage.getItem('isAdmin') === 'true'
            ? helpers.ADMIN_PAGES
            : helpers.SELLER_PAGES
        }
        pageTitle="Ventas"
      >
        <SellerSalesList loading={loading} setLoading={setLoading} />
      </DashboardTemplate>
      {loading ? <Loader loading={loading} /> : <></>}
    </>
  );
}

export default SellersSales;

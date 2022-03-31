import React, { useState } from 'react';
import DashboardTemplate from '../templates/DashboardTemplate';
import Loader from '../molecules/Loader';
import helpers from '../../helpers/helpers';

function SellersPurchases() {
  const [loading, setLoading] = useState(false);

  return (
    <>
      <DashboardTemplate
        displaySearchBar={false}
        sideBarItems={
          localStorage.getItem('isAdmin') === 'true'
            ? helpers.ADMIN_PAGES
            : helpers.SELLER_PAGES
        }
        pageTitle="Compras"
      >
        <div className="alert alert-info mt-4">
          <h5 className="text-center">Esta página aún no está disponible.</h5>
        </div>
      </DashboardTemplate>
      {loading ? <Loader loading={loading} /> : <></>}
    </>
  );
}

export default SellersPurchases;


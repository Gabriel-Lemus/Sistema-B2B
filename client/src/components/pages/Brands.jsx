import React, { useState } from 'react';
import DashboardTemplate from '../templates/DashboardTemplate';
import BrandsForm from '../organisms/BrandsForm';
import Loader from '../molecules/Loader';
import helpers from '../../helpers/helpers';

function Brands() {
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
        pageTitle="Marcas"
      >
        <BrandsForm loading={loading} setLoading={setLoading} />
      </DashboardTemplate>
      {loading ? <Loader loading={loading} /> : <></>}
    </>
  );
}

export default Brands;

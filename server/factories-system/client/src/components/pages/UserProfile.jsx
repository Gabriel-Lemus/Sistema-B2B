import React, { useEffect, useState } from 'react';
import DashboardTemplate from '../templates/DashboardTemplate';
import helpers from '../../helpers/helpers';
import UserProfile from '../organisms/UserProfile';
import Loader from '../molecules/Loader';

function ShoppingCart() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Perfil';
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
        pageTitle="Perfil de Usuario"
      >
        <UserProfile setLoading={setLoading} />
      </DashboardTemplate>
      {loading ? <Loader loading={loading} /> : <></>}
    </>
  );
}

export default ShoppingCart;


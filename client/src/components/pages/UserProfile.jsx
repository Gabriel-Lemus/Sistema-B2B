import React from 'react';
import DashboardTemplate from '../templates/DashboardTemplate';
import helpers from '../../helpers/helpers';
import UserProfile from '../organisms/UserProfile';

function ShoppingCart() {
  return (
    <DashboardTemplate
      displaySearchBar={false}
      sideBarItems={helpers.CLIENT_PAGES}
      pageTitle="Perfil de Usuario"
    >
      <UserProfile />
    </DashboardTemplate>
  );
}

export default ShoppingCart;

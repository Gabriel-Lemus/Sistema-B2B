import React, { useState, useEffect } from 'react';
import helpers from '../../helpers/helpers';
import DashboardTemplate from '../templates/DashboardTemplate';

function DevicesCatalog() {
  // State

  // Effects

  return (
    <DashboardTemplate
      displaySearchBar={false}
      sideBarItems={helpers.CLIENT_PAGES}
      pageTitle="Compras"
    >
      <div className="alert alert-info mt-5">
        Esta página todavía está en desarrollo.
      </div>
    </DashboardTemplate>
  );
}

export default DevicesCatalog;

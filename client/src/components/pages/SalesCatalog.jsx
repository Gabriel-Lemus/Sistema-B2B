import React from 'react';
import DashboardTemplate from '../templates/DashboardTemplate';
import { useParams } from 'react-router-dom';
import SalesCatalogForm from '../organisms/SalesCatalogForm';

function SalesCatalog() {
  // Page parameters
  let { seller } = useParams();

  return (
    <DashboardTemplate
      displaySearchBar={false}
      sideBarItems={[]}
      pageTitle="Catálogo de Ventas"
    >
      <SalesCatalogForm seller={seller} />
    </DashboardTemplate>
  );
}

export default SalesCatalog;

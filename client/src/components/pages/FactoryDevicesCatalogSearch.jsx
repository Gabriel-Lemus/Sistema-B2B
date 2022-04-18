import axios from 'axios';
import React, { useState, useEffect } from 'react';
import helpers from '../../helpers/helpers';
import FactoryDashboardTemplate from '../templates/FactoryDashboardTemplate';
import FactoryDevicesCards from '../molecules/FactoryDevicesCards';
import { useLocation } from 'react-router-dom';
import Loader from '../molecules/Loader';
import secrets from '../../helpers/secrets';

function DevicesCatalogSearch() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(async () => {
    document.title = 'Catálogo de dispositivos';
    let devicesData;

    if (location.state.searchParams !== undefined) {
      devicesData = await axios.get(
        `http://${secrets.LOCALHOST_IP}:${secrets.FACTORIES_BACKEND_PORT}/devices?specializedDeviceSearch=true`,
        {
          params: location.state.searchParams,
        }
      );
    } else {
      const search = location.state.searchParam;
      devicesData = await axios.get(
        `http://${secrets.LOCALHOST_IP}:${secrets.FACTORIES_BACKEND_PORT}/devices?generalizedDeviceSearch=${search}`
      );
    }

    if (devicesData.data.success) {
      if (devicesData.data.devices.length === 0) {
        helpers.showModal(
          'Operación exitosa',
          `Ningún dipositivo concuerda con la búsqueda.`
        );
      }
      setDevices(devicesData.data.devices);
    }
    setLoading(false);
  }, []);

  return (
    <>
      <FactoryDashboardTemplate
        displaySearchBar={true}
        sideBarItems={helpers.SELLER_PAGES}
        pageTitle="Catálogo de dispositivos"
      >
        {devices.length === 0 ? (
          !loading ? (
            <div className="alert alert-info mt-5" role="alert">
              Ningún dispositivo concuerda con la búsqueda realizada.
            </div>
          ) : (
            <></>
          )
        ) : (
          <FactoryDevicesCards devices={devices} />
        )}
      </FactoryDashboardTemplate>
      {loading ? <Loader loading={loading} /> : <></>}
    </>
  );
}

export default DevicesCatalogSearch;


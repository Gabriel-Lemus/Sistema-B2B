import axios from 'axios';
import React, { useState, useEffect } from 'react';
import helpers from '../../helpers/helpers';
import DashboardTemplate from '../templates/DashboardTemplate';
import DevicesCards from '../molecules/DevicesCards';
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

    if (location.state.deviceSearch !== undefined) {
      devicesData = await axios.post(
        `http://${secrets.LOCALHOST_IP}:${secrets.TOMCAT_PORT}/sales-system/sellers?busquedaEspecializada=true`,
        location.state.deviceSearch
      );
    } else {
      const search = location.state.searchParam;
      devicesData = await axios.post(
        `http://${secrets.LOCALHOST_IP}:${secrets.TOMCAT_PORT}/sales-system/sellers?busquedaGeneralizada=${search}`,
        {}
      );
    }

    if (devicesData.data.success) {
      if (devicesData.data.rowCount === 0) {
        helpers.showModal(
          'Operación exitosa',
          `Ningún dipositivo concuerda con la búsqueda.`
        );
      }
      setDevices(devicesData.data.dispositivos);
    }
    setLoading(false);
  }, []);

  return (
    <>
      <DashboardTemplate
        displaySearchBar={true}
        sideBarItems={helpers.CLIENT_PAGES}
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
          <>
            <DevicesCards devices={devices} />
          </>
        )}
      </DashboardTemplate>
      {loading ? <Loader loading={loading} /> : <></>}
    </>
  );
}

export default DevicesCatalogSearch;

import axios from 'axios';
import React, { useState, useEffect } from 'react';
import helpers from '../../helpers/helpers';
import DashboardTemplate from '../templates/DashboardTemplate';
import Loader from '../molecules/Loader';
import { useNavigate } from 'react-router-dom';
import secrets from '../../helpers/secrets';
import FactoriesDevicesCards from '../organisms/FactoriesDevicesCards';

function FactoriesDevicesCatalog() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(async () => {
    document.title = 'Catálogo de dispositivos';

    // Check if user is not logged in
    if (!helpers.isLoggedIn()) {
      navigate('/');
    } else {
      let devicesData = await axios.get(
        `http://${secrets.LOCALHOST_IP}:${secrets.TOMCAT_PORT}/sales-system/sellers?get=true&getFactoriesDevices=true`
      );
      setDevices(devicesData.data.data);
      setLoading(false);
    }
  }, []);

  return (
    <>
      <DashboardTemplate
        displaySearchBar={true}
        sideBarItems={helpers.SELLER_PAGES}
        pageTitle="Catálogo de dispositivos de fábricas"
      >
        {devices.length === 0 ? (
          !loading ? (
            <div className="alert alert-info mt-5" role="alert">
              Lo sentimos, no hay dispositivos registrados en el sistema.
            </div>
          ) : (
            <></>
          )
        ) : (
          <FactoriesDevicesCards devices={devices} />
        )}
      </DashboardTemplate>
      {loading ? <Loader loading={loading} /> : <></>}
    </>
  );
}

export default FactoriesDevicesCatalog;


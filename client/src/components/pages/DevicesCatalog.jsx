import axios from 'axios';
import React, { useState, useEffect } from 'react';
import helpers from '../../helpers/helpers';
import DashboardTemplate from '../templates/DashboardTemplate';
import DevicesCards from '../molecules/DevicesCards';
import Loader from '../molecules/Loader';
import { useNavigate } from 'react-router-dom';

function DevicesCatalog() {
  // State
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Effects
  useEffect(() => {
    document.title = 'Catálogo de dispositivos';

    // Check if user is not logged in
    if (!helpers.isLoggedIn()) {
      navigate('/');
    } else {
      (async () => {
        let devicesData = await axios.get(
          `http://${helpers.LOCALHOST_IP}:${helpers.TOMCAT_PORT}/sales-system/sellers?get=true&dispositivos=true`
        );
        setDevices(devicesData.data.dispositivos);
        setLoading(false);
      })();
    }
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
              Lo sentimos, no hay dispositivos registrados en el sistema.
            </div>
          ) : (
            <></>
          )
        ) : (
          <DevicesCards devices={devices} />
        )}
      </DashboardTemplate>
      {loading ? <Loader loading={loading} /> : <></>}
    </>
  );
}

export default DevicesCatalog;

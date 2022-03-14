import axios from 'axios';
import React, { useState, useEffect } from 'react';
import helpers from '../../helpers/helpers';
import DashboardTemplate from '../templates/DashboardTemplate';
import DevicesCards from '../molecules/DevicesCards';

function DevicesCatalog() {
  // State
  const [devices, setDevices] = useState([]);
  const [devicesImages, setdevicesImages] = useState([]);

  // Effects
  useEffect(() => {
    (async () => {
      let devicesData = await axios.get(
        `http://${helpers.LOCALHOST_IP}:${helpers.TOMCAT_PORT}/sales-system/sellers?dispositivos=true&page=1`
      );
      setDevices(devicesData.data.data);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (devices.length !== 0) {
        let images = [];

        for (let i = 0; i < devices.length; i++) {
          let deviceData = await axios.get(
            `http://localhost:8080/sales-system/sellers?dispositivos=true&dispositivo=${devices[i].id_dispositivo}&vendedor=${devices[i].vendedor}`
          );
          if (
            Object.prototype.hasOwnProperty.call(
              deviceData.data.data[0],
              'fotos'
            )
          ) {
            images.push(deviceData.data.data[0].fotos[0]);
          } else {
            images.push(null);
          }
        }

        setdevicesImages(images);
      }
    })();
  }, [devices]);

  return (
    <DashboardTemplate
      displaySearchBar={true}
      sideBarItems={helpers.CLIENT_PAGES}
      pageTitle="Catálogo de dispositivos"
    >
      {devices.length === 0 ? (
        <>
          <div className="alert alert-info mt-5" role="alert">
            Lo sentimos, no hay dispositivos registrados en el sistema.
          </div>
        </>
      ) : (
        <>
          <DevicesCards devices={devices} images={devicesImages} />
        </>
      )}
    </DashboardTemplate>
  );
}

export default DevicesCatalog;

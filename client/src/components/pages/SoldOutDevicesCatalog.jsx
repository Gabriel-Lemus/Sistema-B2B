import axios from 'axios';
import React, { useState, useEffect } from 'react';
import helpers from '../../helpers/helpers';
import DashboardTemplate from '../templates/DashboardTemplate';
import SoldOutDevicesCards from '../molecules/SoldOutDevicesCards';
import Loader from '../molecules/Loader';
import { useNavigate } from 'react-router-dom';
import secrets from '../../helpers/secrets';

function DevicesCatalog() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(async () => {
    document.title = 'Catálogo de dispositivos agotados';

    // Check if user is not logged in
    if (!helpers.isLoggedIn()) {
      navigate('/');
    } else {
      // let devicesData = await axios.get(
      //   `http://${secrets.LOCALHOST_IP}:${secrets.TOMCAT_PORT}/sales-system/sellers?get=true&dispositivosAgotados=true`
      // );
      let devicesData = await axios.get(
        `http://${secrets.LOCALHOST_IP}:${3002}/devices`
      );
      let devicesList = devicesData.data.data.map((device) => ({
        categoria: device.category,
        codigo_modelo: device.model_code,
        color: device.color,
        descripcion: device.description,
        fotos: device.images,
        id_dispositivo: device._id,
        id_fabrica: device.factoryId,
        nombre: device.name,
        precio: device.price,
        tiempo_garantia: device.warranty_time,
      }));
      console.log(devicesData.data);

      setDevices(devicesList);
      setLoading(false);
    }
  }, []);

  return (
    <>
      <DashboardTemplate
        displaySearchBar={true}
        sideBarItems={
          localStorage.getItem('userType') !== 'distribuidor'
            ? helpers.CLIENT_PAGES
            : helpers.CLIENT_PAGES.concat(helpers.DISTRIBUTOR_CLIENTS_PAGES)
        }
        pageTitle="Catálogo de dispositivos agotados"
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
          <SoldOutDevicesCards devices={devices} />
        )}
      </DashboardTemplate>
      {loading ? <Loader loading={loading} /> : <></>}
    </>
  );
}

export default DevicesCatalog;


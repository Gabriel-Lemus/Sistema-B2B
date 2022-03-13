import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import helpers from '../../helpers/helpers';
import DashboardTemplate from '../templates/DashboardTemplate';

// React icons
import { AiOutlineUser } from 'react-icons/ai';
import { BiPurchaseTagAlt } from 'react-icons/bi';
import { FiBook } from 'react-icons/fi';

function DevicesCatalog() {
  // State
  const [devices, setDevices] = useState([]);

  // Effects
  useEffect(() => {
    (async () => {
      let devicesData = await axios.get(
        `http://${helpers.LOCALHOST_IP}:${helpers.TOMCAT_PORT}/sales-system/sellers?dispositivos=true&page=1`
      );
      setDevices(devicesData.data.data);
    })();
  }, []);

  // Check if the devices is an empty array
  return (
    <DashboardTemplate
      displaySearchBar={true}
      sideBarItems={[
        {
          icon: <FiBook />,
          title: 'Catálogo de dispositivos',
          reference: '/catalogo-dispositivos',
        },
        {
          icon: <BiPurchaseTagAlt />,
          title: 'Compras',
          reference: '/compras',
        },
        {
          icon: <AiOutlineUser />,
          title: 'Perfil',
          reference: '/perfil',
        },
      ]}
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
          <section className="devices-catalog">
            {devices.map((device) => (
              <div className="card product-card" key={devices.indexOf(device)}>
                <div className="card-body">
                  <h5 className="card-title">{device.dispositivo}</h5>
                  <img
                    className="product-image"
                    src={
                      device.imagen !== null && device.imagen !== undefined
                        ? device.imagen
                        : 'https://us.123rf.com/450wm/pavelstasevich/pavelstasevich1811/pavelstasevich181101028/112815904-no-image-available-icon-flat-vector-illustration.jpg?ver=6'
                    }
                    alt="Imagen del dispositivo"
                  />
                  <p className="card-text">
                    {device.descripcion}
                    <br />
                    {device.precio}
                  </p>
                  <Link to={`/devices/${device.id}`}>
                    <button className="btn btn-primary">Ver más</button>
                  </Link>
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </DashboardTemplate>
  );
}

export default DevicesCatalog;

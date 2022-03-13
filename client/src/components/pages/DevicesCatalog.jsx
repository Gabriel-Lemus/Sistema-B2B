import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import helpers from '../../helpers/helpers';
import DashboardTemplate from '../templates/DashboardTemplate';
import DevicesCards from '../molecules/DevicesCards';

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
          <DevicesCards devices={devices} />
        </>
      )}
    </DashboardTemplate>
  );
}

export default DevicesCatalog;

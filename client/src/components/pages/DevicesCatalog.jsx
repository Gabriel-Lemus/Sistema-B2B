import axios from 'axios';
import React, { useState, useEffect } from 'react';
import helpers from '../../helpers/helpers';
import DashboardTemplate from '../templates/DashboardTemplate';
import DevicesCards from '../molecules/DevicesCards';
import { css } from '@emotion/react';
import DotLoader from 'react-spinners/DotLoader';

const override = css`
  position: absolute;
  top: 35%;
  left: 45%;
  margin-top: -50px;
  margin-left: -50px;
`;

function DevicesCatalog() {
  // State
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Effects
  useEffect(() => {
    (async () => {
      let devicesData = await axios.get(
        `http://${helpers.LOCALHOST_IP}:${helpers.TOMCAT_PORT}/sales-system/sellers?get=true&dispositivos=true`
      );
      setDevices(devicesData.data.dispositivos);
      setLoading(false);
    })();
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
          <>
            <DevicesCards devices={devices} />
          </>
        )}
      </DashboardTemplate>
      {loading ? (
        <div className="background-div">
          <DotLoader
            color={helpers.PALETTE.blue}
            loading={loading}
            css={override}
            size={275}
          />
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

export default DevicesCatalog;

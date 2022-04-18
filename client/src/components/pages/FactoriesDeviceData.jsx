import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import DashboardTemplate from '../templates/DashboardTemplate';
import helpers from '../../helpers/helpers';
import FactoriesDeviceDataSection from '../molecules/FactoriesDeviceDataSection';
import $ from 'jquery';
import Loader from '../molecules/Loader';
import secrets from '../../helpers/secrets';

function FactoriesDeviceData() {
  let { factoryId, id } = useParams();
  const [device, setDevice] = useState({});
  const [dataSuccess, setDataSuccess] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [sellerId, setSellerId] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(async () => {
    $('.background-div').css('height', $(document).height());
    $('#sidebarMenu').css('height', $(document.body).height());
    const deviceData = await axios.get(
      `http://${secrets.LOCALHOST_IP}:${secrets.TOMCAT_PORT}/sales-system/sellers?get=true&getFactoryDevice=${id}`
    );

    if (deviceData.data.success) {
      setDataSuccess(true);
      setDevice(deviceData.data.data);
      setCurrentImage(deviceData.data.data.images[0]);
      setSellerId(factoryId);
    }
  }, []);

  const handleAddDevices = async () => {
    if (Number(quantity) > 0) {
      let order = localStorage.getItem('order');
      if (order) {
        order = JSON.parse(localStorage.order);
        let newAmount = Number(quantity);
        let changedAmount = false;
        let oldIdx = -1;
        let newOrder = [];
        // Check if the device is already in the order
        for (let i = 0; i < order.length; i++) {
          if (order[i].id === id && order[i].factoryId === factoryId) {
            newAmount += Number(order[i].cantidad);
            changedAmount = true;
            oldIdx = i;
            break;
          }
        }
        if (changedAmount) {
          for (let i = 0; i < order.length; i++) {
            if (i === oldIdx) {
              newOrder.push({
                id: id,
                factoryId: factoryId,
                nombre: device.name,
                precio: device.price,
                cantidad: newAmount,
                foto: device.images[0],
              });
            } else {
              newOrder.push(order[i]);
            }
          }
          localStorage.setItem('order', JSON.stringify(newOrder));
        } else {
          newOrder = [
            ...order,
            {
              id: id,
              nombre: device.nombre,
              precio: device.price,
              factoryId: factoryId,
              cantidad: Number(quantity),
              foto: device.images[0],
            },
          ];
          localStorage.setItem('order', JSON.stringify(newOrder));
        }
      } else {
        localStorage.setItem(
          'order',
          JSON.stringify([
            {
              id: id,
              nombre: device.nombre,
              precio: device.price,
              factoryId: factoryId,
              cantidad: Number(quantity),
              foto: device.images[0],
            },
          ])
        );
      }
      helpers.showModal(
        'Operación exitosa',
        'Los dispositivos han sido agregados a la orden.'
      );
    } else {
      helpers.showModal(
        'Error',
        'La cantidad por comprar debe ser mayor a 0 y menor o igual a la de existencias'
      );
    }
    $('#order-quantity').val('');
    setQuantity(0);
  };

  return (
    <>
      <DashboardTemplate
        displaySearchBar={false}
        sideBarItems={helpers.SELLER_PAGES}
        pageTitle="Catálogo de dispositivos"
      >
        {!dataSuccess && !loading ? (
          <p>No existe un dispositivo con los datos indicados.</p>
        ) : (
          <FactoriesDeviceDataSection
            deviceId={id}
            device={device}
            setCurrentImage={setCurrentImage}
            currentImage={currentImage}
            factoryId={factoryId}
            setQuantity={setQuantity}
            handleAddDevices={handleAddDevices}
            loading={loading}
            setLoading={setLoading}
          />
        )}
      </DashboardTemplate>
      {loading ? <Loader loading={loading} /> : <></>}
    </>
  );
}

export default FactoriesDeviceData;


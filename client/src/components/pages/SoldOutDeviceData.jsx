import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import DashboardTemplate from '../templates/DashboardTemplate';
import helpers from '../../helpers/helpers';
import SoldOutDeviceDataSection from '../molecules/SoldOutDeviceDataSection';
import $ from 'jquery';
import Loader from '../molecules/Loader';
import secrets from '../../helpers/secrets';

function DeviceData() {
  let { factory, id } = useParams();
  const [device, setDevice] = useState({});
  const [dataSuccess, setDataSuccess] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [sellerId, setSellerId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sellerName, setSellerName] = useState('');

  useEffect(async () => {
    $('.background-div').css('height', $(document).height());
    $('#sidebarMenu').css('height', $(document.body).height());
    // let deviceData = await axios.get(
    //   `http://${secrets.LOCALHOST_IP}:${secrets.TOMCAT_PORT}/sales-system/sellers?get=true&verDispositivo=true&id=${id}&vendedor=${factory}`
    // );
    let deviceData = await axios.get(
      `http://${secrets.LOCALHOST_IP}:${3002}/devices/${id}`
    );
    // let sellerIdNum = await axios.get(
    //   `http://${secrets.LOCALHOST_IP}:${secrets.TOMCAT_PORT}/sales-system/sellers?get=true&sellerId=${factory}`
    // );
    let sellerData = await axios.get(
      `http://${secrets.LOCALHOST_IP}:${3002}/factories/${factory}`
    );
    if (deviceData.data.success) {
      setDataSuccess(true);
      document.title =
        deviceData.data.data.name +
        ' - ' +
        sellerData.data.data.name
      setDevice(deviceData.data.data);
      setCurrentImage(deviceData.data.data.images[0]);
      setSellerId(sellerData.data.data._id);
      setSellerName(sellerData.data.data.name);
    } else {
      setDataSuccess(false);
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
          if (order[i].id === id && order[i].id_vendedor === factory) {
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
                id_fabricante: factory,
                nombre: device.name,
                precio: device.price,
                id_vendedor: sellerId,
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
              nombre: device.name,
              precio: device.price,
              id_vendedor: sellerId,
              id_fabricante: factory,
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
              nombre: device.name,
              precio: device.price,
              id_vendedor: sellerId,
              id_fabricante: factory,
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
      helpers.showModal('Error', 'La cantidad por comprar debe ser mayor a 0.');
    }
    $('#cart-quantity').val('');
    setQuantity(0);
  };

  return (
    <>
      <DashboardTemplate
        displaySearchBar={false}
        sideBarItems={
          localStorage.getItem('userType') !== 'distribuidor'
            ? helpers.CLIENT_PAGES
            : helpers.CLIENT_PAGES.concat(helpers.DISTRIBUTOR_CLIENTS_PAGES)
        }
        pageTitle="Catálogo de dispositivos"
      >
        {!dataSuccess && !loading ? (
          <p>No existe un dispositivo con los datos indicados.</p>
        ) : (
          <SoldOutDeviceDataSection
            deviceId={id}
            device={device}
            setCurrentImage={setCurrentImage}
            currentImage={currentImage}
            seller={sellerName}
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

export default DeviceData;


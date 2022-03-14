import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import DashboardTemplate from '../templates/DashboardTemplate';
import helpers from '../../helpers/helpers';
import DeviceDataSection from '../molecules/DeviceDataSection';

function DeviceData() {
  // Page parameters
  let { seller, id } = useParams();

  // State
  const [device, setDevice] = useState({});
  const [dataSuccess, setDataSuccess] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  const [quantity, setQuantity] = useState(0);

  // Get device data
  useEffect(() => {
    (async () => {
      let deviceData = await axios.get(
        `http://localhost:8080/sales-system/sellers?dispositivos=true&dispositivo=${id}&vendedor=${seller}`
      );
      if (deviceData.data.success) {
        setDataSuccess(true);
        if (
          Object.prototype.hasOwnProperty.call(deviceData.data.data[0], 'fotos')
        ) {
          setDevice(deviceData.data.data[0]);
          setCurrentImage(deviceData.data.data[0].fotos[0]);
        } else {
          let newDevice = JSON.parse(JSON.stringify(deviceData.data.data[0]));
          newDevice.fotos = [
            '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',
          ];

          setDevice(newDevice);
          setCurrentImage(newDevice.fotos[0]);
        }
      } else {
        setDataSuccess(false);
      }
    })();
  }, []);

  // Handlers
  const handleAddDevices = async () => {
    if (
      Number(quantity) > 0 &&
      Number(quantity) <= device.existencias &&
      Number(quantity) !== 0
    ) {
      let cart = localStorage.getItem('cart');

      if (cart) {
        cart = JSON.parse(localStorage.cart);
        let newAmount = Number(quantity);
        let changedAmount = false;
        let oldIdx = -1;
        let newCart = [];

        // Check if the device is already in the cart
        for (let i = 0; i < cart.length; i++) {
          if (cart[i].id === Number(id) && cart[i].vendedor === seller) {
            newAmount += Number(cart[i].cantidad);
            changedAmount = true;
            oldIdx = i;
            break;
          }
        }

        if (changedAmount) {
          for (let i = 0; i < cart.length; i++) {
            if (i === oldIdx) {
              newCart.push({
                id: Number(id),
                vendedor: seller,
                nombre: device.nombre,
                precio: device.precio,
                cantidad: newAmount,
                foto: device.fotos[0],
              });
            } else {
              newCart.push(cart[i]);
            }
          }

          localStorage.setItem('cart', JSON.stringify(newCart));
        } else {
          newCart = [
            ...cart,
            {
              id: Number(id),
              nombre: device.nombre,
              precio: device.precio,
              vendedor: seller,
              cantidad: Number(quantity),
              foto: device.fotos[0],
            },
          ];

          localStorage.setItem('cart', JSON.stringify(newCart));
        }
      } else {
        localStorage.setItem(
          'cart',
          JSON.stringify([
            {
              id: Number(id),
              nombre: device.nombre,
              precio: device.precio,
              vendedor: seller,
              cantidad: Number(quantity),
              foto: device.fotos[0],
            },
          ])
        );
      }

      helpers.showModal(
        'Operación exitosa',
        'Los dispositivos han sido agregados al carrito.'
      );
    } else {
      helpers.showModal(
        'Error',
        'La cantidad por comprar debe ser mayor a 0 y menor o igual a la de existencias'
      );
    }
  };

  return (
    <DashboardTemplate
      displaySearchBar={false}
      sideBarItems={helpers.CLIENT_PAGES}
      pageTitle="Catálogo de dispositivos"
    >
      {!dataSuccess ? (
        <p>No existe un dispositivo con los datos indicados.</p>
      ) : (
        <DeviceDataSection
          deviceId={Number(id)}
          device={device}
          setCurrentImage={setCurrentImage}
          currentImage={currentImage}
          seller={seller}
          setQuantity={setQuantity}
          handleAddDevices={handleAddDevices}
        />
      )}
    </DashboardTemplate>
  );
}

export default DeviceData;

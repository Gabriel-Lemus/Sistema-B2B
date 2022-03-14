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
        setDevice(deviceData.data.data[0]);
        setCurrentImage(deviceData.data.data[0].fotos[0]);
        setDataSuccess(true);
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
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import DashboardTemplate from '../templates/DashboardTemplate';
import helpers from '../../helpers/helpers';
import DeviceDataSection from '../molecules/DeviceDataSection';
import { css } from '@emotion/react';
import DotLoader from 'react-spinners/DotLoader';
import $ from 'jquery';

const override = css`
  position: absolute;
  top: 35%;
  left: 45%;
  margin-top: -50px;
  margin-left: -50px;
`;

function DeviceData() {
  // Page parameters
  let { seller, id } = useParams();

  // State
  const [device, setDevice] = useState({});
  const [dataSuccess, setDataSuccess] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [loading, setLoading] = useState(true);

  // Get device data
  useEffect(() => {
    $('.background-div').css('height', $(document).height());
    $('#sidebarMenu').css('height', $(document).height());
    (async () => {
      let deviceData = await axios.get(
        `http://localhost:8080/sales-system/sellers?get=true&verDispositivo=true&id=${id}&vendedor=${seller}`
      );
      if (deviceData.data.success) {
        setDataSuccess(true);
        setDevice(deviceData.data.dispositivos[0]);
        setCurrentImage(deviceData.data.dispositivos[0].fotos[0]);
        setLoading(false);
      } else {
        setDataSuccess(false);
        setLoading(false);
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
    <>
      <DashboardTemplate
        displaySearchBar={false}
        sideBarItems={helpers.CLIENT_PAGES}
        pageTitle="Catálogo de dispositivos"
      >
        {!dataSuccess && !loading ? (
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

export default DeviceData;

import React, { useState, useEffect } from 'react';
import helpers from '../../helpers/helpers';
import { NavigationType, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ShoppingCartForm() {
  // State
  const [isCartSet, setIsCartSet] = useState(false);
  const [devices, setDevices] = useState([]);
  const [userName, setUserName] = useState('');
  const [userLastName, setUserLastName] = useState('');
  const [userNIT, setUserNIT] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState(-1);
  const [cardExpiration, setCardExpiration] = useState('');
  const [cardCVV, setCardCVV] = useState(-1);
  const navigate = useNavigate();
  let subtotal = 0;

  // Get shopping cart from local storage
  useEffect(() => {
    // Check if there is a shopping cart in local storage
    if (localStorage.getItem('cart')) {
      const cart = JSON.parse(localStorage.cart);
      setDevices(cart);
      setIsCartSet(true);
    }
  }, []);

  // Handlers
  const handlePayment = async () => {
    if (
      userName !== '' &&
      userLastName !== '' &&
      userNIT !== '' &&
      userEmail !== '' &&
      userAddress !== '' &&
      cardHolderName !== '' &&
      cardNumber !== -1 &&
      cardExpiration !== '' &&
      cardCVV !== -1
    ) {
      let distinctSellers = [];
      let distinctSellerIds = [];
      let successfulPosts = 0;
      let successfulUpdates = 0;

      for (let i = 0; i < devices.length; i++) {
        if (
          !distinctSellerIds.includes(devices[i].vendedor) &&
          devices[i].vendedor !== undefined
        ) {
          distinctSellers.push({
            sellerId: devices[i].vendedor,
            products: devices[i].cantidad,
          });
          distinctSellerIds.push(devices[i].vendedor);
        } else {
          let index = distinctSellers.findIndex(
            (seller) => seller.sellerId === devices[i].vendedor
          );
          distinctSellers[index].products += devices[i].cantidad;
        }
      }
      console.log(distinctSellers);

      // Attempt to register the sales
      for (let i = 0; i < distinctSellers.length; i++) {
        let sellerId =
          devices[i].vendedor === 'MAX'
            ? 1
            : devices[i].vendedor === 'Electtronica'
            ? 2
            : 3;
        let discounts = 0;
        let response = await axios.post(
          `http://localhost:8080/sales-system/sellers?seller=${devices[i].vendedor}&table=ventas`,
          {
            id_cliente: 1, // TODO: Change this to the user id
            id_vendedor: sellerId,
            id_dispositivo: devices[i].id,
            fecha_venta: new Date().toISOString().substring(0, 10),
            precio_venta: getTotal(),
            cantidad_dispositivos: distinctSellers[i].products,
            impuestos: getTaxes(),
            descuentos: discounts,
            total_venta: getTotal() - discounts,
          }
        );
        console.log(response.data);

        if (!response.data.success) {
          break;
        } else {
          successfulPosts++;
        }
      }

      for (let i = 0; i < devices.length; i++) {
        let oldDeviceData = await axios.get(
          `http://localhost:8080/sales-system/sellers?seller=${devices[i].vendedor}&table=dispositivos&id=${devices[i].id}`
        );
        console.log(oldDeviceData.data.data);
        console.log(devices[i].cantidad);

        let newDeviceData = {
          id_dispositivo: oldDeviceData.data.data.id_dispositivo,
          id_vendedor: oldDeviceData.data.data.id_vendedor,
          id_marca: oldDeviceData.data.data.id_marca,
          nombre: oldDeviceData.data.data.nombre,
          descripcion: oldDeviceData.data.data.descripcion,
          existencias:
            Number(oldDeviceData.data.data.existencias) -
            Number(devices[i].cantidad),
          precio: oldDeviceData.data.data.precio,
          codigo_modelo: oldDeviceData.data.data.codigo_modelo,
          color: oldDeviceData.data.data.color,
          categoria: oldDeviceData.data.data.categoria,
          tiempo_garantia: oldDeviceData.data.data.tiempo_garantia,
        };
        let couldUpdateDevice = await axios.put(
          `http://localhost:8080/sales-system/sellers?seller=${devices[i].vendedor}&table=dispositivos&id=${devices[i].id}`,
          newDeviceData
        );
        console.log(couldUpdateDevice.data);

        if (!couldUpdateDevice.data.success) {
          break;
        } else {
          successfulUpdates++;
        }
      }

      if (
        successfulPosts === distinctSellers.length &&
        successfulUpdates === devices.length
      ) {
        // Clear the cart
        localStorage.clear();
        helpers.showModal(
          'Operación exitosa',
          'Su pago se ha realizado con éxito.'
        );
      } else {
        helpers.showModal(
          'Hubo un error',
          'Ocurrió un error al procesar su pago. Por favor, inténtelo de nuevo.'
        );
      }
    } else {
      helpers.showModal(
        'Error',
        'Por favor, ingrese todos los datos solicitados.'
      );
    }
  };

  const getSubtotal = () => {
    if (subtotal === 0) {
      devices.map((device) => {
        subtotal += device.precio * device.cantidad;
      });
    }

    return subtotal;
  };

  const getImport = () => {
    return getSubtotal() * 0.15;
  };

  const getTaxes = () => {
    return getSubtotal() * 0.3;
  };

  const getSaleCommision = () => {
    return getSubtotal() * 0.05;
  };

  const getSaleProfit = () => {
    return getSubtotal() * 0.4;
  };

  const getTotal = () => {
    return (
      getSubtotal() +
      getImport() +
      getTaxes() +
      getSaleCommision() +
      getSaleProfit()
    );
  };

  const getDevicesAmount = () => {
    let cantidad = 0;

    devices.map((device) => {
      cantidad += device.cantidad;
    });

    return cantidad;
  };

  return !isCartSet ? (
    <div className="alert alert-info mt-5" role="alert">
      No tiene ningún dispositivo en el carrito de compras.
    </div>
  ) : (
    <section className="shopping-cart-section">
      <section className="billing-info">
        <h3>Información de Facturación</h3>
        <section className="input-row">
          <section className="input-column">
            <label htmlFor="userName" className="input-label mt-3">
              Nombre
            </label>
            <input
              type="text"
              id="userName"
              className="form-control"
              placeholder="Nombre"
              required
              style={{
                backgroundColor: helpers.PALETTE.lightestGreen,
              }}
              onChange={(e) => setUserName(e.target.value)}
            />
          </section>
          <section className="input-column">
            <label htmlFor="userLastName" className="input-label mt-3">
              Apellido
            </label>
            <input
              type="text"
              id="userLastName"
              className="form-control"
              placeholder="Apellido"
              required
              style={{
                backgroundColor: helpers.PALETTE.lightestGreen,
              }}
              onChange={(e) => setUserLastName(e.target.value)}
            />
          </section>
        </section>
        <label htmlFor="NIT" className="input-label mt-3">
          NIT
        </label>
        <input
          type="text"
          id="NIT"
          className="form-control"
          placeholder="NIT"
          required
          style={{
            backgroundColor: helpers.PALETTE.lightestGreen,
            width: '97.3%',
          }}
          onChange={(e) => setUserNIT(e.target.value)}
        />
        <label htmlFor="userEmail" className="input-label mt-3">
          Correo Electrónico
        </label>
        <input
          type="text"
          id="userEmail"
          className="form-control"
          placeholder="Correo Electrónico"
          required
          style={{
            backgroundColor: helpers.PALETTE.lightestGreen,
            width: '97.3%',
          }}
          onChange={(e) => setUserEmail(e.target.value)}
        />
        <label htmlFor="address" className="input-label mt-3">
          Dirección
        </label>
        <input
          type="text"
          id="address"
          className="form-control"
          placeholder="1234 Calle Ejemplo"
          required
          style={{
            backgroundColor: helpers.PALETTE.lightestGreen,
            width: '97.3%',
          }}
          onChange={(e) => setUserAddress(e.target.value)}
        />
        <h3 className="mt-5">Información de Pago</h3>
        <section className="input-row">
          <section className="input-column">
            <label htmlFor="cardHolder" className="input-label mt-3">
              Nombre del Titular
            </label>
            <input
              type="text"
              id="cardHolder"
              className="form-control"
              placeholder="Nombre del Titular"
              required
              style={{
                backgroundColor: helpers.PALETTE.lightestGreen,
              }}
              onChange={(e) => setCardHolderName(e.target.value)}
            />
          </section>
          <section className="input-column">
            <label htmlFor="cardNumber" className="input-label mt-3">
              Número de Tarjeta
            </label>
            <input
              type="number"
              id="cardNumber"
              className="form-control"
              placeholder="Número de Tarjeta"
              required
              style={{
                backgroundColor: helpers.PALETTE.lightestGreen,
              }}
              onChange={(e) => setCardNumber(e.target.value)}
            />
          </section>
        </section>
        <section className="input-row">
          <section className="input-column">
            <label htmlFor="cardExpiration" className="input-label mt-3">
              Fecha de Expiración (mm/aa)
            </label>
            <input
              type="text"
              id="cardExpiration"
              className="form-control"
              placeholder="Fecha de Expiración (mm/aa)"
              required
              style={{
                backgroundColor: helpers.PALETTE.lightestGreen,
              }}
              onChange={(e) => setCardExpiration(e.target.value)}
            />
          </section>
          <section className="input-column">
            <label htmlFor="cardSecurityNumber" className="input-label mt-3">
              Código de Seguridad
            </label>
            <input
              type="number"
              id="cardSecurityNumber"
              className="form-control"
              placeholder="Código de Seguridad"
              required
              style={{
                backgroundColor: helpers.PALETTE.lightestGreen,
              }}
              onChange={(e) => setCardCVV(e.target.value)}
            />
          </section>
        </section>
      </section>
      <section className="cart-info">
        <h3 className="mb-4">Información del Carrito</h3>
        <ul className="list-group shopping-cart-list">
          {devices.map((device, index) => (
            <li
              key={index}
              className="list-group-item list-group-item-action clickable"
              onClick={() => {
                navigate(`/datos-dispositivo/${device.vendedor}/${device.id}`);
              }}
            >
              <div className="d-flex w-100 justify-content-between">
                <h5 className="mb-1">{device.nombre}</h5>
              </div>
              <div className="d-flex w-100 justify-content-between">
                <p>
                  <b>Precio unitario:</b>
                </p>
                <p>{helpers.getFormattedCurrency('Q. ', device.precio)}</p>
              </div>
              <div className="d-flex w-100 justify-content-between">
                <p>
                  <b>Cantidad:</b>
                </p>
                <p>{device.cantidad}</p>
              </div>
              <div className="d-flex w-100 justify-content-between">
                <p>
                  <b>Total</b>
                </p>
                <p>
                  {helpers.getFormattedCurrency(
                    'Q. ',
                    device.precio * device.cantidad
                  )}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <ul className="list-group mt-5 shopping-cart-list">
          <li className="list-group-item">
            <div className="d-flex w-100 justify-content-between">
              <h5 className="mb-1"></h5>
            </div>
            <div className="d-flex w-100 justify-content-between">
              <p>
                <b>Subtotal:</b>
              </p>
              <p>{helpers.getFormattedCurrency('Q. ', getSubtotal())}</p>
            </div>
            <div className="d-flex w-100 justify-content-between">
              <p>
                <b>Comisión de Ventas:</b>
              </p>
              <p>
                {helpers.getFormattedCurrency(
                  'Q. ',
                  getTotal() - getTotal() * 0.12 - getSubtotal()
                )}
              </p>
            </div>
            <div className="d-flex w-100 justify-content-between">
              <p>
                <b>IVA (12%):</b>
              </p>
              <p>{helpers.getFormattedCurrency('Q. ', getTotal() * 0.12)}</p>
            </div>
            <div className="d-flex w-100 justify-content-between">
              <p>
                <b>Total</b>
              </p>
              <p>{helpers.getFormattedCurrency('Q. ', getTotal())}</p>
            </div>
          </li>
        </ul>
        <button
          className="btn btn-primary btn-lg mt-5 mb-5 shopping-cart-list"
          onClick={handlePayment}
        >
          Pagar
        </button>
      </section>
    </section>
  );
}

export default ShoppingCartForm;
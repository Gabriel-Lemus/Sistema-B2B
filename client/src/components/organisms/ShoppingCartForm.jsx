import React, { useState, useEffect } from 'react';
import helpers from '../../helpers/helpers';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import $ from 'jquery';

function ShoppingCartForm(props) {
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
  const [userType, setuserType] = useState('');
  const [discount, setDiscount] = useState(0);
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

    setuserType(localStorage.getItem('userType'));
    const userType = localStorage.getItem('userType');

    // Check if a discount must be applied
    if (userType !== 'individual') {
      if (userType === 'grande') {
        setDiscount(0.05);
      } else {
        setDiscount(0.15);
      }
    }

    props.setLoading(false);
  }, []);

  // Handlers
  const clearCart = () => {
    localStorage.removeItem('cart');
    setIsCartSet(false);
    setDevices([]);
    setUserName('');
    setUserLastName('');
    setUserNIT('');
    setUserEmail('');
    setUserAddress('');
    setCardHolderName('');
    setCardNumber(-1);
    setCardExpiration('');
    setCardCVV(-1);
  };

  const handlePayment = async () => {
    props.setLoading(true);
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
      if (helpers.isValidEmail(userEmail)) {
        if (helpers.isValidCardExpirationDate(cardExpiration)) {
          let distinctSellers = [];
          let distinctSellerIds = [];
          let distinctSales = [];
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
                total: Number(
                  (devices[i].precio * devices[i].cantidad * 1.9).toFixed(2)
                ),
              });
              distinctSellerIds.push(devices[i].vendedor);
            } else {
              let index = distinctSellers.findIndex(
                (seller) => seller.sellerId === devices[i].vendedor
              );
              distinctSellers[index].products += devices[i].cantidad;
              distinctSellers[index].total += Number(
                (devices[i].precio * devices[i].cantidad * 1.9).toFixed(2)
              );
            }
          }

          // Attempt to register the sales
          for (let i = 0; i < distinctSellers.length; i++) {
            let sellerId = devices[i].id_vendedor;
            let discounts =
              localStorage.getItem('userType') === 'distribuidor'
                ? 0.15
                : localStorage.getItem('userType') === 'grande'
                ? 0.05
                : 0;
            let response = await axios.post(
              `http://${helpers.LOCALHOST_IP}:${
                helpers.TOMCAT_PORT
              }/sales-system/sellers?verVendedor=${devices[i].vendedor.replace(
                ' ',
                '_'
              )}&table=${devices[i].vendedor.replace(' ', '_')}_ventas`,
              {
                id_cliente: Number(localStorage.getItem('userId')),
                id_vendedor: sellerId,
                fecha_venta: new Date(new Date().getTime() - 21600000)
                  .toISOString()
                  .substring(0, 10),
                precios_venta:
                  distinctSellers[i].total -
                  distinctSellers[i].total * 0.5 -
                  distinctSellers[i].total * discounts,
                cantidad_dispositivos: distinctSellers[i].products,
                impuestos: Number((distinctSellers[i].total * 0.5).toFixed(2)),
                descuentos: Number(
                  (distinctSellers[i].total * discounts).toFixed(2)
                ),
                total_venta: distinctSellers[i].total,
              }
            );
            distinctSales.push({
              vendedor: devices[i].vendedor,
              id_venta: response.data.dataAdded.id_venta,
            });

            if (!response.data.success) {
              break;
            } else {
              successfulPosts++;
            }
          }

          for (let i = 0; i < devices.length; i++) {
            let oldDeviceData = await axios.get(
              `http://${helpers.LOCALHOST_IP}:${
                helpers.TOMCAT_PORT
              }/sales-system/sellers?get=true&verVendedor=${devices[
                i
              ].vendedor.replace(' ', '_')}&table=${devices[i].vendedor.replace(
                ' ',
                '_'
              )}_dispositivos&id=${devices[i].id}`
            );

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
              `http://${helpers.LOCALHOST_IP}:${
                helpers.TOMCAT_PORT
              }/sales-system/sellers?verVendedor=${devices[i].vendedor.replace(
                ' ',
                '_'
              )}&table=${devices[i].vendedor.replace(
                ' ',
                '_'
              )}_dispositivos&id=${devices[i].id}`,
              newDeviceData
            );
            let deviceXSale = await axios.post(
              `http://${helpers.LOCALHOST_IP}:${
                helpers.TOMCAT_PORT
              }/sales-system/sellers?verVendedor=${devices[i].vendedor.replace(
                ' ',
                '_'
              )}&table=${devices[i].vendedor.replace(
                ' ',
                '_'
              )}_dispositivos_x_ventas`,
              {
                id_venta: distinctSales.find(
                  (sale) => sale.vendedor === devices[i].vendedor
                ).id_venta,
                id_dispositivo: devices[i].id,
                cantidad_dispositivos: devices[i].cantidad,
              }
            );

            if (!couldUpdateDevice.data.success && !deviceXSale.data.success) {
              break;
            } else {
              successfulUpdates++;
            }
          }

          if (
            successfulPosts === distinctSellers.length &&
            successfulUpdates === devices.length
          ) {
            const parsedEmail = userEmail.replace(/\+/g, '%2b');
            const receiptEmail = await axios.post(
              `http://${helpers.LOCALHOST_IP}:${helpers.TOMCAT_PORT}/sales-system/mail?sendReceipt=true&recipient=${parsedEmail}`,
              {
                name: userName,
                subTotal: Number(getSubtotal().toFixed(2)),
                discounts: Number((getSubtotal() * discount).toFixed(2)),
                taxes: Number((getImport() + getTaxes() + getSaleCommision() + getSaleProfit()).toFixed(2)),
                totalPrice: Number(getTotal().toFixed(2)),
                date: new Date().toISOString().substring(0, 10),
                devices: devices.map((device) => ({
                  name: device.nombre,
                  quantity: device.cantidad,
                  unitPrice: device.precio,
                })),
              }
            );

            props.setLoading(false);
            helpers.showOptionModal(
              'Operación exitosa',
              'Su pago se ha realizado con éxito.',
              () => clearCart()
            );
          } else {
            props.setLoading(false);
            helpers.showModal(
              'Hubo un error',
              'Ocurrió un error al procesar su pago. Por favor, inténtelo de nuevo.'
            );
          }
        } else {
          props.setLoading(false);
          helpers.showModal(
            'Datos inválidos',
            'Por favor, ingrese la fecha de expiración de su tarjeta en el formato MM/AA.'
          );
        }
      } else {
        props.setLoading(false);
        helpers.showModal(
          'Datos inválidos',
          'Por favor, ingrese un correo electrónico válido.'
        );
      }
    } else {
      props.setLoading(false);
      helpers.showModal(
        'Datos inválidos',
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

  const getDiscountedSubtotal = (discount) => {
    return getSubtotal() - getSubtotal() * discount;
  };

  const getImport = () => {
    if (localStorage.getItem('userType') === 'individual') {
      return getSubtotal() * 0.15;
    } else {
      return getDiscountedSubtotal(discount) * 0.15;
    }
  };

  const getTaxes = () => {
    if (localStorage.getItem('userType') === 'individual') {
      return getSubtotal() * 0.3;
    } else {
      return getDiscountedSubtotal(discount) * 0.3;
    }
  };

  const getSaleCommision = () => {
    if (localStorage.getItem('userType') === 'individual') {
      return getSubtotal() * 0.05;
    } else {
      return getDiscountedSubtotal(discount) * 0.05;
    }
  };

  const getSaleProfit = () => {
    if (localStorage.getItem('userType') === 'individual') {
      return getSubtotal() * 0.4;
    } else {
      return getDiscountedSubtotal(discount) * 0.4;
    }
  };

  const getTotal = () => {
    if (localStorage.getItem('userType') === 'individual') {
      return (
        getSubtotal() +
        getImport() +
        getTaxes() +
        getSaleCommision() +
        getSaleProfit()
      );
    } else {
      return (
        getDiscountedSubtotal(discount) +
        getImport() +
        getTaxes() +
        getSaleCommision() +
        getSaleProfit()
      );
    }
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
              Fecha de Expiración (MM/AA)
            </label>
            <input
              type="text"
              id="cardExpiration"
              className="form-control"
              placeholder="Fecha de Expiración (MM/AA)"
              maxLength={5}
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
              onChange={(e) => {
                // Only allow 3 digits
                if (e.target.value.length <= 3) {
                  setCardCVV(e.target.value);
                } else {
                  $('#cardSecurityNumber').val(e.target.value.substring(0, 3));
                }
              }}
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
                  <b>Precio de lista:</b>
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
            {userType !== '' ? (
              <>
                <div className="d-flex w-100 justify-content-between">
                  <p>
                    <b>Descuento:</b>
                  </p>
                  <p>
                    {helpers.getFormattedCurrency(
                      'Q. ',
                      getSubtotal() * discount
                    )}
                  </p>
                </div>
                <div className="d-flex w-100 justify-content-between">
                  <p>
                    <b>Total antes de impuestos:</b>
                  </p>
                  <p>
                    {helpers.getFormattedCurrency(
                      'Q. ',
                      getDiscountedSubtotal(discount)
                    )}
                  </p>
                </div>
              </>
            ) : (
              <></>
            )}
            <div className="d-flex w-100 justify-content-between">
              <p>
                <b>Comisión de Ventas:</b>
              </p>
              <p>
                {helpers.getFormattedCurrency(
                  'Q. ',
                  getTotal() -
                    getTotal() * 0.12 -
                    getDiscountedSubtotal(discount)
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
        <div
          className="buttons-section"
          style={{
            width: '90%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <button
            className="btn btn-primary btn-large mt-5 mb-4 shopping-cart-list"
            onClick={handlePayment}
          >
            Pagar
          </button>
          {userType === 'distribuidor' ? (
            <button
              className="btn btn-secondary btn-large mb-4 shopping-cart-list"
              onClick={handlePayment}
            >
              Compra a Crédito
            </button>
          ) : (
            <></>
          )}
          <button
            className="btn btn-danger btn-large mb-5 shopping-cart-list"
            onClick={() => {
              props.setLoading(true);
              setTimeout(() => {
                clearCart();
                props.setLoading(false);
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth',
                });
              }, 750);
            }}
          >
            Limpiar Carrito
          </button>
        </div>
      </section>
    </section>
  );
}

export default ShoppingCartForm;


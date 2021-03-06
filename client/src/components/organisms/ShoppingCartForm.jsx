import React, { useState, useEffect } from 'react';
import helpers from '../../helpers/helpers';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import $ from 'jquery';
import secrets from '../../helpers/secrets';

function ShoppingCartForm(props) {
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
    getClientData();

    props.setLoading(false);
  }, []);

  const getClientData = async () => {
    const clientInfo = await axios.get(
      `http://${secrets.LOCALHOST_IP}:${secrets.TOMCAT_PORT}/sales-system/sales?table=clientes&id=${localStorage.getItem('userId')}`
    );

    if (clientInfo.data.success) {
      setUserName(clientInfo.data.data.nombre.split(' ')[0]);
      setUserLastName(clientInfo.data.data.nombre.split(' ')[1]);
      setUserNIT(clientInfo.data.data.nit !== undefined || clientInfo.data.data.nit !== null ? clientInfo.data.data.nit : '');
      setUserEmail(clientInfo.data.data.email !== undefined || clientInfo.data.data.email !== null ? clientInfo.data.data.email : '');
      setCardHolderName(clientInfo.data.data.nombre);
    }
  }

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

  const handlePayment = async (paid) => {
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
                total:
                  localStorage.getItem('userType') === 'individual'
                    ? devices[i].precio * devices[i].cantidad * 1.9
                    : localStorage.getItem('userType') === 'grande'
                    ? devices[i].precio * devices[i].cantidad * 1.9 * 0.95
                    : devices[i].precio * devices[i].cantidad * 1.9 * 0.85,
              });
              distinctSellerIds.push(devices[i].vendedor);
            } else {
              let index = distinctSellers.findIndex(
                (seller) => seller.sellerId === devices[i].vendedor
              );
              distinctSellers[index].products += devices[i].cantidad;
              distinctSellers[index].total +=
                devices[i].precio * devices[i].cantidad * 1.9;
            }
          }

          let discounts =
            localStorage.getItem('userType') === 'distribuidor'
              ? 0.15
              : localStorage.getItem('userType') === 'grande'
              ? 0.05
              : 0;
          const saleDate = new Date(new Date().getTime() - 21600000)
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ');

          // Attempt to register the sales
          for (let i = 0; i < distinctSellers.length; i++) {
            let sellerId = devices[i].id_vendedor;
            const totalPrice = distinctSellers[i].total / (1 - discounts);
            const discountedPrice = (totalPrice / 1.9) * discounts;
            const salePrices = totalPrice / 1.9;
            const taxes =
              distinctSellers[i].total + discountedPrice - salePrices;
            let response = await axios.post(
              `http://${secrets.LOCALHOST_IP}:${
                secrets.TOMCAT_PORT
              }/sales-system/sellers?verVendedor=${devices[
                i
              ].vendedor.replaceAll(' ', '_')}&table=${devices[
                i
              ].vendedor.replaceAll(' ', '_')}_ventas`,
              {
                id_cliente: Number(localStorage.getItem('userId')),
                id_vendedor: sellerId,
                fecha_venta: saleDate,
                precio_venta: Number(salePrices.toFixed(2)),
                cantidad_dispositivos: distinctSellers.reduce(
                  (acc, cur) => acc + cur.products,
                  0
                ),
                impuestos: Number(taxes.toFixed(2)),
                descuentos: Number(discountedPrice.toFixed(2)),
                total_venta: Number(distinctSellers[i].total.toFixed(2)),
                venta_mostrada: 'False',
                pagado: paid ? 'True' : 'False',
              }
            );
            distinctSales.push({
              vendedor: distinctSellers[i].sellerId,
              id_venta: response.data.dataAdded.id_venta,
            });
            let payment;

            // If the sale was paid, process the payment
            if (paid) {
              payment = await axios.post(
                `http://${secrets.LOCALHOST_IP}:${
                  secrets.TOMCAT_PORT
                }/sales-system/sellers?verVendedor=${devices[
                  i
                ].vendedor.replaceAll(' ', '_')}&table=${devices[
                  i
                ].vendedor.replaceAll(' ', '_')}_pagos`,
                {
                  id_venta: response.data.dataAdded.id_venta,
                  id_cliente: Number(localStorage.getItem('userId')),
                  id_vendedor: sellerId,
                  fecha_pago: saleDate,
                  total: Number(distinctSellers[i].total.toFixed(2)),
                }
              );
            }

            if (!response.data.success && paid && !payment.data.success) {
              break;
            } else {
              successfulPosts++;
            }
          }

          for (let i = 0; i < devices.length; i++) {
            let oldDeviceData = await axios.get(
              `http://${secrets.LOCALHOST_IP}:${
                secrets.TOMCAT_PORT
              }/sales-system/sellers?get=true&verVendedor=${devices[
                i
              ].vendedor.replaceAll(' ', '_')}&table=${devices[
                i
              ].vendedor.replaceAll(' ', '_')}_dispositivos&id=${devices[i].id}`
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
              `http://${secrets.LOCALHOST_IP}:${
                secrets.TOMCAT_PORT
              }/sales-system/sellers?verVendedor=${devices[
                i
              ].vendedor.replaceAll(' ', '_')}&table=${devices[
                i
              ].vendedor.replaceAll(' ', '_')}_dispositivos&id=${
                devices[i].id
              }`,
              newDeviceData
            );
            let deviceXSale = await axios.post(
              `http://${secrets.LOCALHOST_IP}:${
                secrets.TOMCAT_PORT
              }/sales-system/sellers?verVendedor=${devices[
                i
              ].vendedor.replaceAll(' ', '_')}&table=${devices[
                i
              ].vendedor.replaceAll(' ', '_')}_dispositivos_x_ventas`,
              {
                id_venta: distinctSales.find(
                  (sale) => sale.vendedor === devices[i].vendedor
                ).id_venta,
                id_dispositivo: devices[i].id,
                cantidad_dispositivos: devices[i].cantidad,
                precio: devices[i].precio,
                nombre_dispositivo: devices[i].nombre,
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
            const parsedEmail = userEmail.replaceAll(/\+/g, '%2b');
            const receiptEmail = await axios.post(
              `http://${secrets.LOCALHOST_IP}:${secrets.TOMCAT_PORT}/sales-system/mail?sendReceipt=true&recipient=${parsedEmail}`,
              {
                name: userName,
                subTotal: Number(getSubtotal().toFixed(2)),
                discounts: Number((getSubtotal() * discount).toFixed(2)),
                taxes: Number(
                  (
                    getImport() +
                    getTaxes() +
                    getSaleCommision() +
                    getSaleProfit()
                  ).toFixed(2)
                ),
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
              'Operaci??n exitosa',
              paid
                ? 'Su compra ha sido procesada y su pago se ha realizado con ??xito.'
                : 'Su compra ha sido procesada con ??xito. Por favor, recuerde realizar el pago de su compra al finalizar el mes.',
              () => {
                clearCart();
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth',
                });
              }
            );
          } else {
            props.setLoading(false);
            helpers.showModal(
              'Hubo un error',
              'Ocurri?? un error al procesar su pago. Por favor, int??ntelo de nuevo.'
            );
          }
        } else {
          props.setLoading(false);
          helpers.showModal(
            'Datos inv??lidos',
            'Por favor, ingrese la fecha de expiraci??n de su tarjeta en el formato MM/AA.'
          );
        }
      } else {
        props.setLoading(false);
        helpers.showModal(
          'Datos inv??lidos',
          'Por favor, ingrese un correo electr??nico v??lido.'
        );
      }
    } else {
      props.setLoading(false);
      helpers.showModal(
        'Datos inv??lidos',
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
      No tiene ning??n dispositivo en el carrito de compras.
    </div>
  ) : (
    <section className="shopping-cart-section">
      <section className="billing-info">
        <h3>Informaci??n de Facturaci??n</h3>
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
              value={userName}
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
              value={userLastName}
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
          value={userNIT}
          required
          style={{
            backgroundColor: helpers.PALETTE.lightestGreen,
            width: '97.3%',
          }}
          onChange={(e) => setUserNIT(e.target.value)}
        />
        <label htmlFor="userEmail" className="input-label mt-3">
          Correo Electr??nico
        </label>
        <input
          type="text"
          id="userEmail"
          className="form-control"
          placeholder="Correo Electr??nico"
          value={userEmail}
          required
          style={{
            backgroundColor: helpers.PALETTE.lightestGreen,
            width: '97.3%',
          }}
          onChange={(e) => setUserEmail(e.target.value)}
        />
        <label htmlFor="address" className="input-label mt-3">
          Direcci??n
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
        <h3 className="mt-5">Informaci??n de Pago</h3>
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
              value={cardHolderName}
              required
              style={{
                backgroundColor: helpers.PALETTE.lightestGreen,
              }}
              onChange={(e) => setCardHolderName(e.target.value)}
            />
          </section>
          <section className="input-column">
            <label htmlFor="cardNumber" className="input-label mt-3">
              N??mero de Tarjeta
            </label>
            <input
              type="number"
              id="cardNumber"
              min={0}
              className="form-control"
              placeholder="N??mero de Tarjeta"
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
              Fecha de Expiraci??n (MM/AA)
            </label>
            <input
              type="text"
              id="cardExpiration"
              className="form-control"
              placeholder="Fecha de Expiraci??n (MM/AA)"
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
              C??digo de Seguridad
            </label>
            <input
              type="number"
              id="cardSecurityNumber"
              className="form-control"
              placeholder="C??digo de Seguridad"
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
        <h3 className="mb-4">Informaci??n del Carrito</h3>
        <ul className="list-group shopping-cart-list">
          {devices.map((device, index) => (
            <Link
              className="no-underline-link"
              to={`/datos-dispositivo/${device.vendedor}/${device.id}`}
              key={index}
            >
              <li
                key={index}
                className="list-group-item list-group-item-action clickable"
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
            </Link>
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
                      '- Q. ',
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
                <b>Comisi??n de Ventas:</b>
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
            onClick={() => {
              handlePayment(true);
            }}
          >
            Pagar
          </button>
          {userType === 'distribuidor' ? (
            <button
              className="btn btn-secondary btn-large mb-4 shopping-cart-list"
              onClick={() => {
                handlePayment(false);
              }}
            >
              Comprar a Cr??dito
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
              }, 1000);
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


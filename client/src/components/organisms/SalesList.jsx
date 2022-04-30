import axios from 'axios';
import React, { useEffect, useState } from 'react';
import helpers from '../../helpers/helpers';
import secrets from '../../helpers/secrets';
import $ from 'jquery';

function SalesList(props) {
  const [nonCreditPurchases, setNonCreditPurchases] = useState([]);
  const [creditPurchases, setCreditPurchases] = useState([]);
  const [userName, setUserName] = useState('');
  const [userLastName, setUserLastName] = useState('');
  const [userNIT, setUserNIT] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState(-1);
  const [cardExpiration, setCardExpiration] = useState('');
  const [cardCVV, setCardCVV] = useState(-1);

  useEffect(async () => {
    const userId = localStorage.getItem('userId');
    const purchases = await axios.get(
      `http://${secrets.LOCALHOST_IP}:${secrets.TOMCAT_PORT}/sales-system/sellers?get=true&compras=${userId}`
    );
    if (purchases.data.success) {
      setNonCreditPurchases(purchases.data.compras);
      setCreditPurchases(purchases.data.comprasCredito);
    }
    setUserPaymentData();

    props.setLoading(false);
  }, []);

  const setUserPaymentData = async () => {
    const userData = await axios.get(
      `http://${secrets.LOCALHOST_IP}:${
        secrets.TOMCAT_PORT
      }/sales-system/sales?table=clientes&id=${localStorage.getItem('userId')}`
    );
    if (userData.data.success) {
      setUserName(userData.data.data.nombre.split(' ')[0]);
      setUserLastName(userData.data.data.nombre.split(' ')[1]);
      setUserNIT(userData.data.data.nit);
      setUserEmail(userData.data.data.email);
      setCardHolderName(userData.data.data.nombre);
    }
  };

  const handleCreditPurchasesPayment = async () => {
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
          const creditPurchasesPayment = await axios.put(
            `http://${secrets.LOCALHOST_IP}:${
              secrets.TOMCAT_PORT
            }/sales-system/sellers?pagarComprasCredito=${localStorage.getItem(
              'userId'
            )}`,
            {}
          );

          if (creditPurchasesPayment.data.success) {
            const purchases = await axios.get(
              `http://${secrets.LOCALHOST_IP}:${
                secrets.TOMCAT_PORT
              }/sales-system/sellers?get=true&compras=${localStorage.getItem(
                'userId'
              )}`
            );
            if (purchases.data.success) {
              setNonCreditPurchases(purchases.data.compras);
              setCreditPurchases(purchases.data.comprasCredito);
              props.setLoading(false);
              helpers.showModal(
                'Pago realizado con éxito',
                'Se ha realizado el pago de las compras a crédito con éxito.'
              );
            }
          } else {
            props.setLoading(false);
            helpers.showModal(
              'Error',
              'Ha ocurrido un error al realizar el pago de las compras a crédito.'
            );
          }
        } else {
          props.setLoading(false);
          helpers.showModal(
            'Dato inválido',
            'La fecha de expiración de la tarjeta de crédito es inválida. Por favor introduzca una fecha en el formato MM/AA.'
          );
        }
      } else {
        props.setLoading(false);
        helpers.showModal(
          'Dato inválido',
          'El correo electrónico es inválido. Por favor introduzca un correo electrónico válido.'
        );
      }
    } else {
      props.setLoading(false);
      helpers.showModal(
        'Datos faltantes',
        'Por favor, ingrese  todos los datos solicitados para poder realizar el pago.'
      );
    }
  };

  return !props.loading ? (
    <>
      <h3 className="text-left mt-4">Compras al contado</h3>
      {nonCreditPurchases.length !== 0 ? (
        <div className="purchases">
          {nonCreditPurchases.map((purchaseList, index) => (
            <div className="purchases-list" key={index}>
              <h5 className="text-left">Compra #{index + 1}</h5>
              <p style={{ marginBottom: '0' }}>
                Fecha: {helpers.formatDate(purchaseList[0].fecha_venta)}
              </p>
              <p className="mb-4">
                Dispositivos adquiridos: {purchaseList[0].dispositivos_totales}
              </p>
              <table className="table purchases-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Precio</th>
                    <th>Cantidad</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                {purchaseList.map((purchase, index) => (
                  <tbody key={index}>
                    <tr>
                      <td>{purchase.dispositivo}</td>
                      <td>
                        {helpers.getFormattedCurrency('Q. ', purchase.precio)}
                      </td>
                      <td>x {purchase.cantidad_dispositivos}</td>
                      <td className="text-right">
                        {helpers.getFormattedCurrency(
                          'Q. ',
                          purchase.precio * purchase.cantidad_dispositivos
                        )}
                      </td>
                    </tr>
                  </tbody>
                ))}
              </table>
              <table className="table purchases-table">
                <tbody>
                  <tr>
                    <td className="font-italic">
                      <strong>Subtotal:</strong>
                    </td>
                    <td className="text-right">
                      {helpers.getFormattedCurrency(
                        'Q. ',
                        purchaseList.reduce(
                          (acc, purchase) =>
                            acc +
                            purchase.precio * purchase.cantidad_dispositivos,
                          0
                        )
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-italic">
                      <strong>Descuentos:</strong>
                    </td>
                    <td className="text-right">
                      {helpers.getFormattedCurrency(
                        '- Q. ',
                        purchaseList.reduce(
                          (acc, purchase) => acc + purchase.descuentos,
                          0
                        )
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-italic">
                      <strong>Impuestos + Comisión de Ventas:</strong>
                    </td>
                    <td className="text-right">
                      {helpers.getFormattedCurrency(
                        'Q. ',
                        purchaseList.reduce(
                          (acc, purchase) => acc + purchase.impuestos,
                          0
                        )
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-italic">
                      <strong>Total:</strong>
                    </td>
                    <td className="text-right">
                      {helpers.getFormattedCurrency(
                        'Q. ',
                        purchaseList.reduce(
                          (acc, purchase) => acc + purchase.total_venta,
                          0
                        )
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info mt-4">
          <h5 className="text-center">
            No ha realizado ninguna compra al contado aún.
          </h5>
        </div>
      )}
      {creditPurchases.length !== 0 ? (
        <>
          {localStorage.getItem('userType') === 'distribuidor' ? (
            <>
              <h3 className="text-left mt-5">Compras a crédito</h3>
              {creditPurchases.length === 0 ? (
                <div
                  className="alert alert-info"
                  style={{
                    width: '100%',
                  }}
                >
                  <p>No ha realizado ninguna compra a crédito aún.</p>
                </div>
              ) : (
                creditPurchases.map((purchaseList, index) => (
                  <div className="purchases-list" key={index}>
                    <h5 className="text-left">Compra #{index + 1}</h5>
                    <p style={{ marginBottom: '0' }}>
                      Fecha: {helpers.formatDate(purchaseList[0].fecha_venta)}
                    </p>
                    <p className="mb-4">
                      Dispositivos adquiridos:{' '}
                      {purchaseList[0].dispositivos_totales}
                    </p>
                    <table className="table purchases-table">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Precio</th>
                          <th>Cantidad</th>
                          <th className="text-right">Total</th>
                        </tr>
                      </thead>
                      {purchaseList.map((purchase, index) => (
                        <tbody key={index}>
                          <tr>
                            <td>{purchase.dispositivo}</td>
                            <td>
                              {helpers.getFormattedCurrency(
                                'Q. ',
                                purchase.precio
                              )}
                            </td>
                            <td>x {purchase.cantidad_dispositivos}</td>
                            <td className="text-right">
                              {helpers.getFormattedCurrency(
                                'Q. ',
                                purchase.precio * purchase.cantidad_dispositivos
                              )}
                            </td>
                          </tr>
                        </tbody>
                      ))}
                    </table>
                    <table className="table purchases-table">
                      <tbody>
                        <tr>
                          <td className="font-italic">
                            <strong>Subtotal:</strong>
                          </td>
                          <td className="text-right">
                            {helpers.getFormattedCurrency(
                              'Q. ',
                              purchaseList.reduce(
                                (acc, purchase) =>
                                  acc +
                                  purchase.precio *
                                    purchase.cantidad_dispositivos,
                                0
                              )
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="font-italic">
                            <strong>Descuentos:</strong>
                          </td>
                          <td className="text-right">
                            {helpers.getFormattedCurrency(
                              '- Q. ',
                              purchaseList.reduce(
                                (acc, purchase) => acc + purchase.descuentos,
                                0
                              )
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="font-italic">
                            <strong>Impuestos + Comisión de Ventas:</strong>
                          </td>
                          <td className="text-right">
                            {helpers.getFormattedCurrency(
                              'Q. ',
                              purchaseList.reduce(
                                (acc, purchase) => acc + purchase.impuestos,
                                0
                              )
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="font-italic">
                            <strong>Total:</strong>
                          </td>
                          <td className="text-right">
                            {helpers.getFormattedCurrency(
                              'Q. ',
                              purchaseList.reduce(
                                (acc, purchase) => acc + purchase.total_venta,
                                0
                              )
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ))
              )}
            </>
          ) : (
            <></>
          )}
          <div className="billing-section">
            <section className="billing-info-2">
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
                value={Number(userNIT)}
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
                value={userEmail}
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
                    Número de Tarjeta
                  </label>
                  <input
                    type="number"
                    id="cardNumber"
                    min={0}
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
                  <label
                    htmlFor="cardSecurityNumber"
                    className="input-label mt-3"
                  >
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
                        $('#cardSecurityNumber').val(
                          e.target.value.substring(0, 3)
                        );
                      }
                    }}
                  />
                </section>
              </section>
              <button
                className="btn btn-primary mt-5 mb-4"
                onClick={handleCreditPurchasesPayment}
                style={{
                  width: '97.5%',
                }}
              >
                Pagar compras a crédito
              </button>
            </section>
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  ) : (
    <></>
  );
}

export default SalesList;


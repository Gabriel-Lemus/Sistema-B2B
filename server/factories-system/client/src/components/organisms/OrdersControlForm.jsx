import React, { useState, useEffect } from 'react';
import helpers from '../../helpers/helpers';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import $ from 'jquery';
import secrets from '../../helpers/secrets';

function OrdersForm(props) {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [newPendingOrders, setNewPendingOrders] = useState([]);
  const [canSavePendingOrders, setCanSavePendingOrders] = useState(false);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [clientId, setClientId] = useState('');
  const navigate = useNavigate();
  let subtotal = 0;

  useEffect(() => {
    setClientId(localStorage.getItem('id'));
  }, []);

  useEffect(async () => {
    getOrders();
    props.setLoading(false);
  }, [clientId]);

  const getOrders = async () => {
    if (clientId !== '') {
      const orders = await axios.get(
        `http://${secrets.LOCALHOST_IP}:${secrets.FACTORIES_BACKEND_PORT}/orders?clientOrders=${clientId}`
      );

      let pendingOrders = JSON.parse(JSON.stringify(orders.data.pendingOrders));
      const completedOrders = JSON.parse(
        JSON.stringify(orders.data.deliveredOrders)
      );
      const cancelledOrders = JSON.parse(
        JSON.stringify(orders.data.cancelledOrders)
      );

      // Iterate through the devices of the pending orders and set each device toDelete to false
      pendingOrders.forEach((order) => {
        order.devices.forEach((device) => {
          device.toDelete = false;
        });
      });

      // If a cancelled order doesn't have any devices, remove it from the cancelled orders array
      for (let i = 0; i < cancelledOrders.length; i++) {
        if (cancelledOrders[i].devices.length === 0) {
          cancelledOrders.splice(i, 1);
          i--;
        }
      }

      // Iterate through the pending orders and their devices and remove the table-danger class from each of them
      for (let i = 0; i < pendingOrders.length; i++) {
        for (let j = 0; j < pendingOrders[i].devices.length; j++) {
          $(`#pending-orders-table-${i}`)
            .find('tr')
            .eq(j + 1)
            .removeClass('table-danger');

          // Uncheck the checkbox of the device
          $(`#pending-orders-table-${i}`)
            .find('tr')
            .eq(j + 1)
            .find('input')
            .prop('checked', false);
        }
      }

      setPendingOrders(pendingOrders);
      setNewPendingOrders(pendingOrders);
      setCompletedOrders(completedOrders);
      setCancelledOrders(cancelledOrders);
    }
  };

  const checkThereAreChangesInPendingOrders = (orders1, orders2) => {
    // Iterate through the pending orders
    for (let i = 0; i < orders1.length; i++) {
      // Iterate through the pending orders devices
      for (let j = 0; j < orders1[i].devices.length; j++) {
        if (
          !helpers.compareObjects(orders1[i].devices[j], orders2[i].devices[j])
        ) {
          return true;
        }
      }
    }

    return false;
  };

  const handleSavePendingOrders = async () => {
    props.setLoading(true);
    let changedOrders = [];

    // Iterate through the pending orders and check if there are changes
    for (let i = 0; i < newPendingOrders.length; i++) {
      // Iterate through the pending orders devices
      for (let j = 0; j < newPendingOrders[i].devices.length; j++) {
        if (
          !helpers.compareObjects(
            pendingOrders[i].devices[j],
            newPendingOrders[i].devices[j]
          )
        ) {
          changedOrders.push(newPendingOrders[i]);
          break;
        }
      }
    }

    const updatedOrders = {
      orders: changedOrders,
    };

    // Attempt to save the changes in the pending orders
    try {
      const updatePendingOrdersRes = await axios.put(
        `http://${secrets.LOCALHOST_IP}:${secrets.FACTORIES_BACKEND_PORT}/?updateOrders=true`,
        updatedOrders
      );

      if (updatePendingOrdersRes.data.success) {
        getOrders();
        props.setLoading(false);
        helpers.showModal(
          'Operación exitosa',
          'Las modificaciones de las órdenes fueron guardadas correctamente.'
        );
      } else {
        props.setLoading(false);
        helpers.showModal(
          'Error',
          'Hubo un error al guardar las modificaciones de las órdenes. Por favor, intente nuevamente.'
        );
      }
    } catch (error) {
      props.setLoading(false);
      helpers.showModal(
        'Error',
        'Ocurrió un error al tratar de guardar los cambios. Por favor, inténtelo nuevamente.'
      );
    }
  };

  const handlePayOrder = async (orderIndex, isClientOrder) => {
    props.setLoading(true);
    let payOrderRes;
    let payParam;

    if (!isClientOrder) {
      payParam = `payOrder=${completedOrders[orderIndex]._id}`;
    } else {
      payParam = `payClientOrder=${completedOrders[orderIndex]._id}`;
    }

    payOrderRes = await axios.put(
      `http://${secrets.LOCALHOST_IP}:${secrets.FACTORIES_BACKEND_PORT}/?${payParam}`,
      {}
    );

    if (payOrderRes.data.success) {
      let newCompletedOrders = JSON.parse(JSON.stringify(completedOrders));

      newCompletedOrders[orderIndex].completelyPayed = true;

      for (let i = 0; i < newCompletedOrders[orderIndex].devices.length; i++) {
        newCompletedOrders[orderIndex].devices[i].payed = true;
        newCompletedOrders[orderIndex].devices[i].canBeDisplayed = true;
      }

      setCompletedOrders(newCompletedOrders);
      props.setLoading(false);
      helpers.showModal(
        'Operación exitosa',
        'La orden fue pagada correctamente.'
      );
    } else {
      props.setLoading(false);
      helpers.showModal(
        'Error',
        'Hubo un error al tratar de pagar la orden. Por favor, intente nuevamente.'
      );
    }
  };

  return !props.loading ? (
    <>
      <section className="client-orders">
        <section className="pending-orders">
          <h2 className="mt-3 mb-4">Órdenes pendientes</h2>
          {newPendingOrders.length > 0 ? (
            newPendingOrders.map((order, index) => (
              <section className="order-container" key={index}>
                <section className="order-header">
                  <h4>Orden #{index + 1}</h4>
                  <p>
                    Fecha estimada de entrega:{' '}
                    {helpers.formatDate2(order.maxDeliveryDate)}
                  </p>
                  <h5 className="mt-2 mb-3">Dispositivos:</h5>
                  <table id={`pending-orders-table-${index}`} className="table">
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Nombre</th>
                        <th scope="col">Cantidad</th>
                        <th scope="col">Precio</th>
                        <th scope="col">Subtotal</th>
                        <th scope="col">
                          <div className="checkbox-center">
                            ¿Eliminar dispositivo?
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.devices.map((device, deviceIndex) => (
                        <tr key={deviceIndex}>
                          <th scope="row">{deviceIndex + 1}</th>
                          <td>{device.name}</td>
                          <td>
                            <section className="input-row">
                              {!order.devices[deviceIndex].delivered &&
                              !order.isClientOrder ? (
                                device.toDelete === undefined ||
                                !device.toDelete ? (
                                  <>
                                    <button
                                      className="btn btn-primary btn-sm btn-outline-secondary"
                                      onClick={() => {
                                        const potentialNewPendingOrders =
                                          JSON.parse(
                                            JSON.stringify(newPendingOrders)
                                          );
                                        if (
                                          potentialNewPendingOrders[index]
                                            .devices[deviceIndex].quantity > 1
                                        ) {
                                          potentialNewPendingOrders[index]
                                            .devices[deviceIndex].quantity--;
                                          setNewPendingOrders(
                                            potentialNewPendingOrders
                                          );
                                          setCanSavePendingOrders(
                                            checkThereAreChangesInPendingOrders(
                                              pendingOrders,
                                              potentialNewPendingOrders
                                            )
                                          );
                                        }
                                      }}
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      className="form-control form-control-sm device-quantity-input"
                                      value={device.quantity}
                                      min="1"
                                      onChange={(e) => {
                                        const potentialNewPendingOrders =
                                          JSON.parse(
                                            JSON.stringify(newPendingOrders)
                                          );
                                        potentialNewPendingOrders[
                                          index
                                        ].devices[deviceIndex].quantity =
                                          Number(e.target.value);
                                        setNewPendingOrders(
                                          potentialNewPendingOrders
                                        );
                                        setCanSavePendingOrders(
                                          checkThereAreChangesInPendingOrders(
                                            pendingOrders,
                                            potentialNewPendingOrders
                                          )
                                        );
                                      }}
                                    />
                                    <button
                                      className="btn btn-primary btn-sm btn-outline-secondary"
                                      onClick={() => {
                                        const potentialNewPendingOrders =
                                          JSON.parse(
                                            JSON.stringify(newPendingOrders)
                                          );
                                        potentialNewPendingOrders[index]
                                          .devices[deviceIndex].quantity++;
                                        setNewPendingOrders(
                                          potentialNewPendingOrders
                                        );
                                        setCanSavePendingOrders(
                                          checkThereAreChangesInPendingOrders(
                                            pendingOrders,
                                            potentialNewPendingOrders
                                          )
                                        );
                                      }}
                                    >
                                      +
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      disabled
                                      className="btn btn-primary btn-sm btn-outline-secondary disabled-btn"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      className="form-control form-control-sm device-quantity-input"
                                      value={device.quantity}
                                      min="1"
                                      readOnly
                                    />
                                    <button
                                      disabled
                                      className="btn btn-primary btn-sm btn-outline-secondary disabled-btn"
                                    >
                                      +
                                    </button>
                                  </>
                                )
                              ) : (
                                device.quantity
                              )}
                            </section>
                          </td>
                          <td>
                            {helpers.getFormattedCurrency('Q. ', device.price)}
                          </td>
                          <td>
                            {helpers.getFormattedCurrency(
                              'Q. ',
                              device.quantity * device.price
                            )}
                          </td>
                          <td>
                            <div className="checkbox-center">
                              {!order.devices[deviceIndex].delivered &&
                              !order.isClientOrder ? (
                                <input
                                  type="checkbox"
                                  onChange={(e) => {
                                    const potentialNewPendingOrders =
                                      JSON.parse(
                                        JSON.stringify(newPendingOrders)
                                      );
                                    potentialNewPendingOrders[index].devices[
                                      deviceIndex
                                    ].toDelete = e.target.checked;

                                    if (e.target.checked) {
                                      potentialNewPendingOrders[index].devices[
                                        deviceIndex
                                      ].quantity = 0;

                                      $(`#pending-orders-table-${index}`)
                                        .find('tr')
                                        .eq(deviceIndex + 1)
                                        .addClass('table-danger');
                                    } else {
                                      potentialNewPendingOrders[index].devices[
                                        deviceIndex
                                      ].quantity =
                                        pendingOrders[index].devices[
                                          deviceIndex
                                        ].quantity;

                                      $(`#pending-orders-table-${index}`)
                                        .find('tr')
                                        .eq(deviceIndex + 1)
                                        .removeClass('table-danger');
                                    }

                                    setNewPendingOrders(
                                      potentialNewPendingOrders
                                    );
                                    setCanSavePendingOrders(
                                      checkThereAreChangesInPendingOrders(
                                        pendingOrders,
                                        potentialNewPendingOrders
                                      )
                                    );
                                  }}
                                  className="form-check-input remove-device-checkbox"
                                />
                              ) : order.devices[deviceIndex].delivered ? (
                                <div>Dispositivo(s) ya entregado</div>
                              ) : (
                                <div>Orden de cliente</div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
                <section className="order-footer">
                  <h5
                    className="mt-4 text-right"
                    style={{
                      marginRight: '10px',
                    }}
                  >
                    Total:{' '}
                    {helpers.getFormattedCurrency(
                      'Q. ',
                      order.devices.reduce(
                        (total, device) =>
                          (total += device.quantity * device.price),
                        0
                      )
                    )}
                  </h5>
                </section>
              </section>
            ))
          ) : (
            <div className="alert alert-info mt-3 mb-3" role="alert">
              No hay órdenes pendientes
            </div>
          )}
          {canSavePendingOrders ? (
            <button
              className="btn btn-primary btn-sm btn-outline-secondary"
              onClick={handleSavePendingOrders}
              style={{
                width: '100%',
              }}
            >
              Guardar cambios en las órdenes pendientes
            </button>
          ) : (
            <button
              className="btn btn-primary btn-sm btn-outline-secondary disabled-btn"
              disabled
              style={{
                width: '100%',
              }}
            >
              No hay cambios para guardar
            </button>
          )}
        </section>
        <section className="completed-orders mt-5">
          <h2>Órdenes entregadas</h2>
          {completedOrders.length > 0 ? (
            completedOrders.map((order, index) => (
              <section className="order-container" key={index}>
                <section className="order-header">
                  <h3>Orden #{index + 1}</h3>
                  <p>
                    <b>Fecha de entrega:</b>{' '}
                    {helpers.formatDate2(order.deliveredDate)}
                  </p>
                  {order.completelyPayed === undefined ||
                  !order.completelyPayed ? (
                    <></>
                  ) : (
                    <div className="mb-3">
                      La orden ya fue entregada y pagada.
                    </div>
                  )}
                  <h5>Dispositivos:</h5>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Nombre</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.devices.map((device, deviceIndex) => (
                        <tr key={deviceIndex}>
                          <td>{deviceIndex + 1}</td>
                          <td>{device.name}</td>
                          <td>{device.quantity}</td>
                          <td>
                            {helpers.getFormattedCurrency('Q. ', device.price)}
                          </td>
                          <td>
                            {helpers.getFormattedCurrency(
                              'Q. ',
                              device.quantity * device.price
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
                <section className="order-footer">
                  <h5
                    className="mt-4 text-right"
                    style={{
                      marginRight: '10px',
                    }}
                  >
                    Total:{' '}
                    {helpers.getFormattedCurrency(
                      'Q. ',
                      order.devices.reduce(
                        (total, device) =>
                          (total += device.quantity * device.price),
                        0
                      )
                    )}
                  </h5>
                </section>
                {order.completelyPayed === undefined ||
                !order.completelyPayed ? (
                  <button
                    className="btn btn-primary btn-sm btn-outline-secondary mt-3"
                    onClick={() => {
                      handlePayOrder(
                        index,
                        order.isClientOrder !== undefined
                          ? order.isClientOrder
                          : false
                      );
                    }}
                    style={{
                      width: '100%',
                    }}
                  >
                    Pagar
                  </button>
                ) : (
                  <></>
                )}
              </section>
            ))
          ) : (
            <div className="alert alert-info mt-3 mb-3" role="alert">
              No hay órdenes entregadas
            </div>
          )}
        </section>
        <section className="canceled-orders mt-5">
          <h2>Órdenes canceladas</h2>
          {cancelledOrders.length > 0 ? (
            cancelledOrders.map((order, index) => (
              <section className="order-container" key={index}>
                <section className="order-header">
                  <h3>Orden #{index + 1}</h3>
                  <h5 className="mt-4">Dispositivos:</h5>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Nombre</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.devices.map((device, deviceIndex) => (
                        <tr key={deviceIndex}>
                          <td>{deviceIndex + 1}</td>
                          <td>{device.name}</td>
                          <td>{device.quantity}</td>
                          <td>
                            {helpers.getFormattedCurrency('Q. ', device.price)}
                          </td>
                          <td>
                            {helpers.getFormattedCurrency(
                              'Q. ',
                              device.quantity * device.price
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
                <section className="order-footer">
                  <h5
                    className="mt-4 text-right"
                    style={{
                      marginRight: '10px',
                    }}
                  >
                    Total:{' '}
                    {helpers.getFormattedCurrency(
                      'Q. ',
                      order.devices.reduce(
                        (total, device) =>
                          (total += device.quantity * device.price),
                        0
                      )
                    )}
                  </h5>
                </section>
              </section>
            ))
          ) : (
            <div className="alert alert-info mt-3 mb-3" role="alert">
              No hay órdenes canceladas
            </div>
          )}
        </section>
      </section>
    </>
  ) : (
    <></>
  );
}

export default OrdersForm;


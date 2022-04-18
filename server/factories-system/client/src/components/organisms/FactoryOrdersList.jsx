import axios from 'axios';
import React, { useEffect, useState } from 'react';
import helpers from '../../helpers/helpers';
import IndividualTextInput from './IndividualTextInput';
import secrets from '../../helpers/secrets';

function ClientsList(props) {
  const [orders, setOrders] = useState([]);

  useEffect(async () => {
    const ordersData = await axios.get(
      `http://${secrets.LOCALHOST_IP}:${
        secrets.FACTORIES_BACKEND_PORT
      }/orders?nonDeliveredOrders=${localStorage.getItem('id')}`
    );
    setOrders(ordersData.data.nonDeliveredOrders);

    props.setLoading(false);
  }, []);

  const handleSubmitOrder = async (deviceId, orderId, index) => {
    props.setLoading(true);
    const deliverOrder = await axios.put(
      `http://${secrets.LOCALHOST_IP}:${secrets.FACTORIES_BACKEND_PORT}/?deliverOrder=${orderId}&deviceId=${deviceId}`,
      {}
    );

    if (deliverOrder.data.success) {
      setOrders(orders.filter((_order, i) => i !== index));
      props.setLoading(false);
      helpers.showModal(
        'Operación exitosa',
        'La orden fue entregada correctamente.'
      );
    } else {
      props.setLoading(false);
      helpers.showModal(
        'Error',
        'Hubo un error al enviar la orden, intente nuevamente'
      );
    }
  };

  return !props.loading ? (
    orders.length !== 0 ? (
      orders.map((order, index) => (
        <div className="column mb-4" key={index}>
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <h4 className="card-title mt-2">Orden #{index + 1}</h4>
              </div>
              <div className="card-body">
                <div className="column">
                  <div className="mb-2">
                    <b>Cliente:</b> {order.client.name}
                  </div>
                  <div className="mb-2">
                    <b>Dispositivo:</b> {order.deviceData.name}
                  </div>
                  <div className="mb-2">
                    <b>Cantidad:</b> {order.orderDevice.quantity}
                  </div>
                  <div className="mb-2">
                    <b>Precio:</b>{' '}
                    {helpers.getFormattedCurrency(
                      'Q. ',
                      order.orderDevice.price
                    )}
                  </div>
                  <div className="mb-2">
                    <b>Total: </b>
                    {helpers.getFormattedCurrency(
                      'Q. ',
                      order.orderDevice.quantity * order.orderDevice.price
                    )}
                  </div>
                  <div>
                    <b>Fecha de máxima de entrega: </b>
                    {helpers.formatDate2(
                      new Date(
                        order.orderDevice.estimatedDeliveryDate
                      ).toString()
                    )}
                  </div>
                  <div>
                    <b>Días restantes para la entrega: </b>
                    {helpers.getDifferenceInDays(
                      new Date(
                        order.orderDevice.estimatedDeliveryDate
                      ).toString()
                    )}
                  </div>
                </div>
                <button
                  className="btn btn-success mt-3"
                  onClick={() => {
                    handleSubmitOrder(
                      order.orderDevice._id,
                      order.orderId,
                      index
                    );
                  }}
                  style={{ width: '100%' }}
                >
                  Entregar orden
                </button>
              </div>
            </div>
          </div>
        </div>
      ))
    ) : (
      <div className="alert alert-info" role="alert">
        No hay órdenes pendientes por entregar.
      </div>
    )
  ) : (
    <></>
  );
}

export default ClientsList;


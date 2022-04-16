import React, { useState, useEffect } from 'react';
import helpers from '../../helpers/helpers';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import $ from 'jquery';
import secrets from '../../helpers/secrets';

function OrdersForm(props) {
  const [isOrderSet, setIsOrderSet] = useState(false);
  const [devices, setDevices] = useState([]);
  const navigate = useNavigate();
  let subtotal = 0;

  // Get the orders from local storage
  useEffect(() => {
    // Check if there is an order in local storage
    if (localStorage.getItem('order')) {
      const order = JSON.parse(localStorage.order);
      setDevices(order);
      setIsOrderSet(true);
    }

    props.setLoading(false);
  }, []);

  const clearOrder = () => {
    localStorage.removeItem('order');
    setIsOrderSet(false);
    setDevices([]);
  };

  const handleSubmitOrder = async () => {
    props.setLoading(true);

    const order = {
      clientId: localStorage.getItem('id'),
      completed: false,
      maxDeliveryDate: null,
      canceled: false,
      devices: [
        ...devices.map((device) => ({
          factoryId: device.factoryId,
          deviceId: device.id,
          quantity: device.cantidad,
          price: device.precio,
          estimatedDeliveryDate: null,
          delivered: false,
          payed: false,
          deliveredDate: null,
          canBeDisplayed: false,
          displayed: false,
        })),
      ],
    };

    const uploadOrder = await axios.post(
      `http://${secrets.LOCALHOST_IP}:${secrets.FACTORIES_BACKEND_PORT}/orders?newOrder=true`,
      order
    );

    if (uploadOrder.data.success) {
      localStorage.removeItem('order');
      setIsOrderSet(false);
      setDevices([]);
      props.setLoading(false);
      helpers.showModal(
        'Operación exitosa',
        'Su orden ha sido registrada correctamente.'
      );
    } else {
      props.setLoading(false);
      helpers.showModal(
        'Error',
        'Ocurrió un error al registrar su orden. Por favor, intente nuevamente.'
      );
    }
  };

  const getTotal = () => {
    if (subtotal === 0) {
      devices.map((device) => {
        subtotal += device.precio * device.cantidad;
      });
    }

    return subtotal;
  };

  const getDevicesAmount = () => {
    let cantidad = 0;

    devices.map((device) => {
      cantidad += device.cantidad;
    });

    return cantidad;
  };

  return !isOrderSet ? (
    <div className="alert alert-info mt-5" role="alert">
      Aún no ha realizado ninguna orden.
    </div>
  ) : (
    <section className="shopping-cart-section">
      <section className="cart-info">
        <h3 className="mb-4">Información de la Orden</h3>
        <ul className="list-group shopping-cart-list">
          {devices.map((device, index) => (
            <Link
              className="no-underline-link"
              to={`/datos-dispositivo/${device.factoryId}/${device.id}`}
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
                <b>Total:</b>
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
            onClick={handleSubmitOrder}
            style={{
              width: '100%',
            }}
          >
            Realizar Orden
          </button>
          <button
            className="btn btn-danger btn-large mb-5 shopping-cart-list"
            style={{
              width: '100%',
            }}
            onClick={() => {
              props.setLoading(true);
              setTimeout(() => {
                clearOrder();
                props.setLoading(false);
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth',
                });
              }, 1000);
            }}
          >
            Eliminar Orden
          </button>
        </div>
      </section>
    </section>
  );
}

export default OrdersForm;


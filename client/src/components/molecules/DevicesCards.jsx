import React from 'react';
import { Link } from 'react-router-dom';
import helpers from '../../helpers/helpers';

function DevicesCatalog(props) {
  return (
    <section className="devices-catalog">
      {props.devices.map((device, index) => (
        <div className="card product-card" key={props.devices.indexOf(device)}>
          <div className="card-body product-card-body">
            <h5 className="card-title">{device.dispositivo}</h5>
            <img
              className="product-image"
              src={
                device.fotos[0].slice(0, 7) === 'http://' || device.fotos[0].slice(0, 8) === 'https://'
                  ? device.fotos[0]
                  : `http://${helpers.LOCALHOST_IP}${device.fotos[0]}`
              }
              alt="Imagen del dispositivo"
              style={{
                maxWidth: '80%',
                height: 'auto',
              }}
            />
            <p className="card-text">
              {device.descripcion.length < 25
                ? device.descripcion
                : `${device.descripcion.substring(0, 25)}...`}
              <br />
              {helpers.getFormattedCurrency('Q. ', device.precio * 1.9)}
            </p>
            <Link
              to={`/datos-dispositivo/${device.vendedor}/${device.id_dispositivo}`}
            >
              <button className="btn btn-primary">Conocer más</button>
            </Link>
          </div>
        </div>
      ))}
    </section>
  );
}

export default DevicesCatalog;

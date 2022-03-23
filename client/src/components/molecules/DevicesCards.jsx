import React from 'react';
import { Link } from 'react-router-dom';
import helpers from '../../helpers/helpers';

function DevicesCatalog(props) {
  return (
    <section className="devices-catalog">
      {props.devices.map((device, index) => (
        <div className="card product-card" key={props.devices.indexOf(device)}>
          <div className="card-body">
            <h5 className="card-title">{device.dispositivo}</h5>
            <img
              className="product-image"
              src={device.fotos[0]}
              alt="Imagen del dispositivo"
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

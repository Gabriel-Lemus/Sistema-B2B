import React from 'react';
import { Link } from 'react-router-dom';
import helpers from '../../helpers/helpers';
import secrets from '../../helpers/secrets';

function DevicesCatalog(props) {
  return (
    <section className="devices-catalog">
      {props.devices.map((device, index) => (
        <div className="card product-card" key={props.devices.indexOf(device)}>
          <div className="card-body product-card-body">
            <h5 className="card-title">{device.name}</h5>
            <img
              className="product-image"
              src={
                device.images[0].slice(0, 7) === 'http://' ||
                device.images[0].slice(0, 8) === 'https://'
                  ? device.images[0]
                  : `http://${secrets.LOCALHOST_IP}${device.images[0]}`
              }
              alt="Imagen del dispositivo"
              style={{
                height: '150px',
                width: 'auto',
                maxWidth: '195px',
              }}
            />
            <p className="card-text">
              {device.description.length < 25
                ? device.description
                : `${device.description.substring(0, 25)}...`}
              <br />
              {helpers.getFormattedCurrency('Q. ', device.price)}
            </p>
            <Link
              to={`/datos-dispositivo/${device.factoryId}/${device._id}`}
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


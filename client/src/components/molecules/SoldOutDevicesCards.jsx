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
            <h5 className="card-title">{device.nombre}</h5>
            <img
              className="product-image"
              src={
                device.fotos[0].slice(0, 7) === 'http://' ||
                device.fotos[0].slice(0, 8) === 'https://'
                  ? device.fotos[0]
                  : `http://${secrets.LOCALHOST_IP}${device.fotos[0]}`
              }
              alt="Imagen del dispositivo"
              style={{
                height: '150px',
                width: 'auto',
                maxWidth: '195px',
              }}
            />
            <p className="card-text">
              {device.descripcion.length < 25
                ? device.descripcion
                : `${device.descripcion.substring(0, 25)}...`}
              <br />
              {localStorage.getItem('userType') === 'individual'
                ? helpers.getFormattedCurrency('Q. ', device.precio * 1.9)
                : localStorage.getItem('userType') === 'grande'
                ? helpers.getFormattedCurrency(
                    'Q. ',
                    device.precio * 1.9 * 0.95
                  )
                : helpers.getFormattedCurrency(
                    'Q. ',
                    device.precio * 1.9 * 0.85
                  )}
            </p>
            <Link
              to={`/datos-dispositivo-por-encargo/${device.id_fabrica}/${device.id_dispositivo}`}
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


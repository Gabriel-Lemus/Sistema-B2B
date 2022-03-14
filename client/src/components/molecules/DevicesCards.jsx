import React from 'react';
import { Link } from 'react-router-dom';

function DevicesCatalog(props) {
  return (
    <section className="devices-catalog">
      {props.devices.map((device, index) => (
        <div className="card product-card" key={props.devices.indexOf(device)}>
          <div className="card-body">
            <h5 className="card-title">{device.dispositivo}</h5>
            <img
              className="product-image"
              src={
                props.images[index] !== null && props.images[index] !== undefined
                  ? `data:image/png;base64,${props.images[index]}`
                  : 'https://us.123rf.com/450wm/pavelstasevich/pavelstasevich1811/pavelstasevich181101028/112815904-no-image-available-icon-flat-vector-illustration.jpg?ver=6'
              }
              alt="Imagen del dispositivo"
            />
            <p className="card-text">
              {device.descripcion}
              <br />
              {device.precio}
            </p>
            <Link to={`/datos-dispositivo/${device.vendedor}/${device.id_dispositivo}`}>
              <button className="btn btn-primary">Ver más</button>
            </Link>
          </div>
        </div>
      ))}
    </section>
  );
}

export default DevicesCatalog;

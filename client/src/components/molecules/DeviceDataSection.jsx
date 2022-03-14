import React, { useEffect } from 'react';
import $ from 'jquery';
import helpers from '../../helpers/helpers';

function DeviceDataSection(props) {
  return (
    <section className="device-information-section">
      <section className="device-images">
        {Object.prototype.hasOwnProperty.call(props.device, 'fotos') ? (
          props.device.fotos.map((foto, index) => {
            return (
              <img
                key={index}
                src={
                  foto.substring(0, 22) !== 'data:image/png;base64,'
                    ? `data:image/png;base64,${foto}`
                    : foto
                }
                alt={`Imagen ${index}`}
                className={'device-image' + (index === 0 ? '-active' : '')}
                onClick={() => {
                  $('.device-image-active').addClass('device-image');
                  $('.device-image-active').removeClass('device-image-active');
                  $('.device-image').eq(index).addClass('device-image-active');
                  $('.device-image').eq(index).removeClass('device-image');
                  props.setCurrentImage(foto);
                }}
              />
            );
          })
        ) : (
          <></>
        )}
      </section>
      <section className="main-image">
        <img
          className="main-device-image"
          src={
            props.currentImage !== ''
              ? props.currentImage.substring(0, 22) !== 'data:image/png;base64,'
                ? `data:image/png;base64,${props.currentImage}`
                : props.currentImage
              : ''
          }
          alt={props.device.nombre}
        />
      </section>
      <section className="device-information">
        <h1 className="mb-5">{props.device.nombre}</h1>
        <table className="table table-responsive-md">
          <tbody>
            <tr>
              <td>
                <b>Descripcion:</b>
              </td>
              <td>{props.device.descripcion}</td>
            </tr>
            <tr>
              <td>
                <b>Precio:</b>
              </td>
              <td>
                {helpers.getFormattedCurrency('Q. ', Object.prototype.hasOwnProperty.call(props.device, 'precio') ? props.device.precio : 0)}
              </td>
            </tr>
            <tr>
              <td>
                <b>Vendedor:</b>
              </td>
              <td>{props.seller}</td>
            </tr>
            <tr>
              <td>
                <b>Categoría:</b>
              </td>
              <td>{props.device.categoria}</td>
            </tr>
            <tr>
              <td>
                <b>Código de Modelo:</b>
              </td>
              <td>{props.device.codigo_modelo}</td>
            </tr>
            <tr>
              <td>
                <b>Color:</b>
              </td>
              <td>{props.device.color}</td>
            </tr>
            <tr>
              <td>
                <b>Años de Garantía:</b>
              </td>
              <td>{props.device.tiempo_garantia}</td>
            </tr>
            <tr>
              <td>
                <b>Existencias:</b>
              </td>
              <td>{props.device.existencias}</td>
            </tr>
          </tbody>
        </table>
        <div className="input-group mb-3">
          <input
            type="number"
            className="form-control"
            placeholder="Cantidad"
            aria-label="Cantidad"
            aria-describedby="button-addon"
            min={1}
            max={props.device.existencias}
            onChange={(e) => {
              props.setQuantity(e.target.value);
            }}
          />
          <div className="input-group-append">
            <button
              className="btn btn-primary"
              type="button"
              id="button-addon"
              onClick={props.handleAddDevices}
            >
              Button
            </button>
          </div>
        </div>
      </section>
    </section>
  );
}

export default DeviceDataSection;

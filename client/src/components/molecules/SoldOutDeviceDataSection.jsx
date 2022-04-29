import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import helpers from '../../helpers/helpers';
import axios from 'axios';
import secrets from '../../helpers/secrets';

function DeviceDataSection(props) {
  useEffect(() => {
    $('main h1').text(props.device.name);
    props.setLoading(false);
    if (
      Object.prototype.hasOwnProperty.call(props.device, 'name') &&
      props.currentImage !== ''
    ) {
      // if (newPrice === 0) {
      //   $('#device-price').val((props.device.precio * 1.9).toFixed(2));
      //   $('#device-list-price').val(props.device.precio.toFixed(2));
      // } else {
      //   $('#device-price').val(newPrice.toFixed(2));
      //   $('#device-list-price').val(newDeviceListPrice.toFixed(2));
      // }
      // setDevice(props.device);
    }
  }, [props]);

  return !props.loading ? (
    <section className="device-information-section">
      <section className="device-images">
        {Object.prototype.hasOwnProperty.call(props.device, 'images') ? (
          props.device.images.map((img, index) => {
            return (
              <img
                key={index}
                src={
                  img.slice(0, 7) === 'http://' ||
                  img.slice(0, 8) === 'https://'
                    ? img
                    : `http://${secrets.LOCALHOST_IP}${img}`
                }
                alt={`Imagen ${index}`}
                className={'device-image' + (index === 0 ? '-active' : '')}
                style={{
                  maxHeight: '175px',
                  maxWidth: '90%',
                  height: 'auto',
                }}
                onClick={() => {
                  $('.device-image-active').addClass('device-image');
                  $('.device-image-active').removeClass('device-image-active');
                  $('.device-image').eq(index).addClass('device-image-active');
                  $('.device-image').eq(index).removeClass('device-image');
                  props.setCurrentImage(img);
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
            props.currentImage.slice(0, 7) === 'http://' ||
            props.currentImage.slice(0, 8) === 'https://'
              ? props.currentImage
              : `http://${secrets.LOCALHOST_IP}${props.currentImage}`
          }
          alt={props.device.name}
          style={{
            maxHeight: '700px',
            maxWidth: '85%',
            height: 'auto',
          }}
        />
      </section>
      <section className="device-information">
        <h3 className="text mb-4">{props.device.name}</h3>
        <table className="table table-responsive-md">
          <tbody>
            <tr>
              <td>
                <b>Descripcion:</b>
              </td>
              <td>{props.device.description}</td>
            </tr>
            <tr>
              <td>
                <b>Precio Unitario:</b>
              </td>
              <td>
                {helpers.getFormattedCurrency(
                  'Q. ',
                  Number(props.device.price)
                )}
              </td>
            </tr>
            <tr>
              <td>
                <b>Categoría:</b>
              </td>
              <td>{props.device.category}</td>
            </tr>
            <tr>
              <td>
                <b>Código de Modelo:</b>
              </td>
              <td>{props.device.model_code}</td>
            </tr>
            <tr>
              <td>
                <b>Marca:</b>
              </td>
              <td>{props.seller}</td>
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
              <td>{props.device.warranty_time}</td>
            </tr>
            <tr>
              <td>
                <b>Tiempo de envío (días):</b>
              </td>
              <td>+{props.device.shipping_time}</td>
            </tr>
          </tbody>
        </table>
        <div className="input-group mb-3">
          <input
            id="cart-quantity"
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
              Agregar a la Orden
            </button>
          </div>
        </div>
      </section>
    </section>
  ) : (
    <></>
  );
}

export default DeviceDataSection;


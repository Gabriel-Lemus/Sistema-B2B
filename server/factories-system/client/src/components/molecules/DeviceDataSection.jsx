import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import helpers from '../../helpers/helpers';
import axios from 'axios';
import secrets from '../../helpers/secrets';

function DeviceDataSection(props) {
  const [device, setDevice] = useState({});
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceDescription, setNewDeviceDescription] = useState('');
  const [newDevicePrice, setNewDevicePrice] = useState(0);
  const [newPrice, setNewPrice] = useState(0);
  const [newDeviceCategory, setNewDeviceCategory] = useState('');
  const [newDeviceModelCode, setNewDeviceModelCode] = useState('');
  const [newDeviceColor, setNewDeviceColor] = useState('');
  const [newDeviceWarranty, setNewDeviceWarranty] = useState(0);
  const [newDeviceShippingTime, setNewDeviceShippingTime] = useState(0);
  const [changedDevice, setChangedDevice] = useState(false);
  const [factoryName, setFactoryName] = useState('');

  useEffect(() => {
    $('#device-price').val(newPrice.toFixed(2));
  }, [newPrice]);

  useEffect(() => {
    $('main h1').text(props.device.name);
    if (
      Object.prototype.hasOwnProperty.call(props.device, 'name') &&
      props.currentImage !== ''
    ) {
      if (newPrice === 0) {
        $('#device-price').val(props.device.price.toFixed(2));
      } else {
        $('#device-price').val(newPrice.toFixed(2));
      }
      setDevice(props.device);
    }
  }, [props]);

  useEffect(async () => {
    const deviceFactory = await axios.get(
      `http://${secrets.LOCALHOST_IP}:${secrets.FACTORIES_BACKEND_PORT}/factories/${props.factoryId}`
    );
    setFactoryName(deviceFactory.data.data.name);
    props.setLoading(false);
  }, []);

  // Functions
  const handleDeviceUpdate = async () => {
    props.setLoading(true);
    let potentialNewDevice = {
      factoryId: props.factoryId,
      name: newDeviceName !== '' ? newDeviceName : device.name,
      description:
        newDeviceDescription !== '' ? newDeviceDescription : device.description,
      price: newDevicePrice !== 0 ? newDevicePrice : device.price,
      category: newDeviceCategory !== '' ? newDeviceCategory : device.category,
      model_code:
        newDeviceModelCode !== '' ? newDeviceModelCode : device.modelCode,
      color: newDeviceColor !== '' ? newDeviceColor : device.color,
      warranty_time:
        newDeviceWarranty !== 0 ? newDeviceWarranty : device.warranty,
      shipping_time:
        newDeviceShippingTime !== 0
          ? newDeviceShippingTime
          : device.shippingTime,
      images: device.images,
    };
    const deviceUpdate = await axios.put(
      `http://${secrets.LOCALHOST_IP}:${secrets.FACTORIES_BACKEND_PORT}/devices/${props.device._id}`,
      potentialNewDevice
    );
    if (deviceUpdate.data.success) {
      setChangedDevice(false);
      props.device.name = newDeviceName !== '' ? newDeviceName : device.name;
      props.device.description =
        newDeviceDescription !== '' ? newDeviceDescription : device.description;
      props.device.price = newDevicePrice !== 0 ? newDevicePrice : device.price;
      props.device.category =
        newDeviceCategory !== '' ? newDeviceCategory : device.category;
      props.device.model_code =
        newDeviceModelCode !== '' ? newDeviceModelCode : device.modelCode;
      props.device.color =
        newDeviceColor !== '' ? newDeviceColor : device.color;
      props.device.warranty_time =
        newDeviceWarranty !== 0 ? newDeviceWarranty : device.warranty;
      props.device.shipping_time = newDeviceShippingTime !== 0
        ? newDeviceShippingTime
        : device.shippingTime;
      props.device.images = device.images;
      setNewDeviceName(newDeviceName);
      setNewDeviceDescription(newDeviceDescription);
      setNewPrice(newDevicePrice);
      setNewDeviceCategory(newDeviceCategory);
      setNewDeviceModelCode(newDeviceModelCode);
      setNewDeviceColor(newDeviceColor);
      setNewDeviceWarranty(newDeviceWarranty);
      props.setLoading(false);
      helpers.showModal(
        'Operación exitosa',
        'El dispositivo ha sido actualizado'
      );
    } else {
      props.setLoading(false);
      helpers.showModal('Ocurrió un error', 'Por favor, intente de nuevo.');
    }
  };

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
          alt={props.device.nombre}
          style={{
            maxHeight: '700px',
            maxWidth: '85%',
            height: 'auto',
          }}
        />
      </section>
      <section className="device-information">
        <input
          type="text"
          className="form-control mb-5"
          defaultValue={props.device.name}
          onChange={(e) => {
            setNewDeviceName(e.target.value);
            setChangedDevice(e.target.value !== props.device.name);
          }}
        />
        <table className="table table-responsive-md">
          <tbody>
            <tr>
              <td>
                <b>Descripcion:</b>
              </td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  defaultValue={props.device.description}
                  onChange={(e) => {
                    setNewDeviceDescription(e.target.value);
                    setChangedDevice(
                      e.target.value !== props.device.description
                    );
                  }}
                />
              </td>
            </tr>
            <tr>
              <td>
                <b>Precio Unitario:</b>
              </td>
              <td>
                <input
                  id="device-price"
                  type="number"
                  step=".01"
                  className="form-control"
                  min={0}
                  defaultValue={
                    Object.prototype.hasOwnProperty.call(props.device, 'price')
                      ? props.device.price
                      : 0
                  }
                  onChange={(e) => {
                    setNewDevicePrice(Number(e.target.value));
                    setChangedDevice(
                      Number(e.target.value) !== props.device.price
                    );
                  }}
                />
              </td>
            </tr>
            <tr>
              <td>
                <b>Vendedor:</b>
              </td>
              <td>
                <div>{factoryName}</div>
              </td>
            </tr>
            <tr>
              <td>
                <b>Categoría:</b>
              </td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  defaultValue={props.device.category}
                  onChange={(e) => {
                    setNewDeviceCategory(e.target.value);
                    setChangedDevice(e.target.value !== props.device.category);
                  }}
                />
              </td>
            </tr>
            <tr>
              <td>
                <b>Código de Modelo:</b>
              </td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  defaultValue={props.device.model_code}
                  onChange={(e) => {
                    setNewDeviceModelCode(e.target.value);
                    setChangedDevice(
                      e.target.value !== props.device.model_code
                    );
                  }}
                />
              </td>
            </tr>
            <tr>
              <td>
                <b>Color:</b>
              </td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  defaultValue={props.device.color}
                  onChange={(e) => {
                    setNewDeviceColor(e.target.value);
                    setChangedDevice(e.target.value !== props.device.color);
                  }}
                />
              </td>
            </tr>
            <tr>
              <td>
                <b>Años de Garantía:</b>
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  defaultValue={props.device.warranty_time}
                  onChange={(e) => {
                    setNewDeviceWarranty(Number(e.target.value));
                    setChangedDevice(
                      Number(e.target.value) !== props.device.warranty_time
                    );
                  }}
                />
              </td>
            </tr>
            <tr>
              <td>
                <b>Tiempo de envío (días):</b>
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  defaultValue={props.device.shipping_time}
                  onChange={(e) => {
                    setNewDeviceShippingTime(Number(e.target.value));
                    setChangedDevice(
                      Number(e.target.value) !== props.device.shipping_time
                    );
                  }}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <div className="input-group mb-3">
          <input
            id="order-quantity"
            type="number"
            className="form-control"
            placeholder="Cantidad"
            aria-label="Cantidad"
            aria-describedby="button-addon"
            min={1}
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
        {!changedDevice ? (
          <button
            className="btn btn-primary btn-large mt-3 mb-5"
            disabled
            style={{
              width: '100%',
            }}
          >
            Actualizar Dispositivo
          </button>
        ) : (
          <button
            className="btn btn-primary btn-large mt-3 mb-5"
            onClick={handleDeviceUpdate}
            style={{
              width: '100%',
            }}
          >
            Actualizar Dispositivo
          </button>
        )}
      </section>
    </section>
  ) : (
    <></>
  );
}

export default DeviceDataSection;


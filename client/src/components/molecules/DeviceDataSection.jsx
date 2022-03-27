import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import helpers from '../../helpers/helpers';
import axios from 'axios';

function DeviceDataSection(props) {
  // State
  const [device, setDevice] = useState({});
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceDescription, setNewDeviceDescription] = useState('');
  const [newDevicePrice, setNewDevicePrice] = useState(0);
  const [newPrice, setNewPrice] = useState(0);
  const [newDeviceCategory, setNewDeviceCategory] = useState('');
  const [newDeviceModelCode, setNewDeviceModelCode] = useState('');
  const [newDeviceColor, setNewDeviceColor] = useState('');
  const [newDeviceWarranty, setNewDeviceWarranty] = useState(0);
  const [newDeviceExistance, setNewDeviceExistance] = useState(0);
  const [changedDevice, setChangedDevice] = useState(false);

  // Effects
  useEffect(() => {
    $('#device-price').val(newPrice.toFixed(2));
  }, [newPrice]);

  useEffect(() => {
    $('main h1').text(props.device.nombre);
    if (
      Object.prototype.hasOwnProperty.call(props.device, 'nombre') &&
      props.currentImage !== ''
    ) {
      if (newPrice === 0) {
        $('#device-price').val((props.device.precio * 1.9).toFixed(2));
      } else {
        $('#device-price').val(newPrice.toFixed(2));
      }
      setDevice(props.device);
    }
  }, [props]);

  // Functions
  const handleDeviceUpdate = async () => {
    props.setLoading(true);
    let potentialNewDevice = {
      nombre: newDeviceName !== '' ? newDeviceName : device.nombre,
      descripcion:
        newDeviceDescription !== '' ? newDeviceDescription : device.descripcion,
      precio:
        newDevicePrice !== 0
          ? (newDevicePrice / 1.9).toFixed(2)
          : device.precio,
      categoria:
        newDeviceCategory !== '' ? newDeviceCategory : device.categoria,
      codigo_modelo:
        newDeviceModelCode !== '' ? newDeviceModelCode : device.codigo_modelo,
      color: newDeviceColor !== '' ? newDeviceColor : device.color,
      tiempo_garantia:
        newDeviceWarranty !== 0 ? newDeviceWarranty : device.tiempo_garantia,
      existencias:
        newDeviceExistance !== 0 ? newDeviceExistance : device.existencias,
    };
    let deviceUpdate = await axios.put(
      `http://${helpers.LOCALHOST_IP}:${
        helpers.TOMCAT_PORT
      }/sales-system/sellers?verVendedor=${
        props.seller
      }&table=${props.seller.replace(' ', '_')}_dispositivos&id=${
        props.deviceId
      }`,
      potentialNewDevice
    );
    if (deviceUpdate.data.success) {
      setChangedDevice(false);
      setNewPrice(newDevicePrice);
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

  return (
    <section className="device-information-section">
      <section className="device-images">
        {Object.prototype.hasOwnProperty.call(props.device, 'fotos') ? (
          props.device.fotos.map((foto, index) => {
            return (
              <img
                key={index}
                src={
                  foto.slice(0, 7) === 'http://' ||
                  foto.slice(0, 8) === 'https://'
                    ? foto
                    : `http://${helpers.LOCALHOST_IP}${foto}`
                }
                alt={`Imagen ${index}`}
                className={'device-image' + (index === 0 ? '-active' : '')}
                style={{
                  maxWidth: '90%',
                  height: 'auto',
                }}
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
            props.currentImage.slice(0, 7) === 'http://' ||
            props.currentImage.slice(0, 8) === 'https://'
              ? props.currentImage
              : `http://${helpers.LOCALHOST_IP}${props.currentImage}`
          }
          alt={props.device.nombre}
          style={{
            maxWidth: '85%',
            height: 'auto',
          }}
        />
      </section>
      <section className="device-information">
        <input
          type="text"
          className="form-control mb-5"
          defaultValue={props.device.nombre}
          onChange={(e) => {
            setNewDeviceName(e.target.value);
            if (e.target.value !== device.nombre) {
              setChangedDevice(true);
            } else {
              setChangedDevice(false);
            }
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
                  defaultValue={props.device.descripcion}
                  onChange={(e) => {
                    setNewDeviceDescription(e.target.value);
                    if (e.target.value !== device.descripcion) {
                      setChangedDevice(true);
                    } else {
                      setChangedDevice(false);
                    }
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
                  className="form-control"
                  min={0}
                  defaultValue={
                    Object.prototype.hasOwnProperty.call(props.device, 'precio')
                      ? props.device.precio
                      : 0
                  }
                  onChange={(e) => {
                    setNewDevicePrice(Number(e.target.value));
                    if (Number(e.target.value) !== device.precio) {
                      setChangedDevice(true);
                    } else {
                      setChangedDevice(false);
                    }
                  }}
                />
              </td>
            </tr>
            <tr>
              <td>
                <b>Vendedor:</b>
              </td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  defaultValue={props.seller}
                />
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
                  defaultValue={props.device.categoria}
                  onChange={(e) => {
                    setNewDeviceCategory(e.target.value);
                    if (e.target.value !== device.categoria) {
                      setChangedDevice(true);
                    } else {
                      setChangedDevice(false);
                    }
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
                  defaultValue={props.device.codigo_modelo}
                  onChange={(e) => {
                    setNewDeviceModelCode(e.target.value);
                    if (e.target.value !== device.codigo_modelo) {
                      setChangedDevice(true);
                    } else {
                      setChangedDevice(false);
                    }
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
                    if (e.target.value !== device.color) {
                      setChangedDevice(true);
                    } else {
                      setChangedDevice(false);
                    }
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
                  defaultValue={props.device.tiempo_garantia}
                  onChange={(e) => {
                    setNewDeviceWarranty(Number(e.target.value));
                    if (Number(e.target.value) !== device.tiempo_garantia) {
                      setChangedDevice(true);
                    } else {
                      setChangedDevice(false);
                    }
                  }}
                />
              </td>
            </tr>
            <tr>
              <td>
                <b>Existencias:</b>
              </td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  defaultValue={props.device.existencias}
                  onChange={(e) => {
                    setNewDeviceExistance(Number(e.target.value));
                    if (Number(e.target.value) !== device.existencias) {
                      setChangedDevice(true);
                    } else {
                      setChangedDevice(false);
                    }
                  }}
                />
              </td>
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
              Agregar al Carrito
            </button>
          </div>
        </div>
        {!changedDevice ? (
          <button className="btn btn-primary btn-large mb-5" disabled>
            Actualizar Dispositivo
          </button>
        ) : (
          <button
            className="btn btn-primary btn-large mb-5"
            onClick={handleDeviceUpdate}
          >
            Actualizar Dispositivo
          </button>
        )}
      </section>
    </section>
  );
}

export default DeviceDataSection;

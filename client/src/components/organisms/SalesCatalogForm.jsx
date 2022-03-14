import axios from 'axios';
import React, { useState, useEffect } from 'react';
import helpers from '../../helpers/helpers';
import $ from 'jquery';

function SalesCatalogForm(props) {
  // State
  const [devices, setDevices] = useState([]);
  const [newDevices, setNewDevices] = useState([]);
  const [catalogChanged, setCatalogChanged] = useState(false);
  const [newDevicesToAdd, setNewDevicesToAdd] = useState([]);
  const [canAddNewDevices, setCanAddNewDevices] = useState(false);

  // Effect
  useEffect(() => {
    (async () => {
      let sellerDevices = await axios.get(
        `http://${helpers.LOCALHOST_IP}:${helpers.TOMCAT_PORT}/sales-system/sellers?seller=${props.seller}&table=dispositivos`
      );
      setDevices(sellerDevices.data.data);
      setNewDevices(sellerDevices.data.data);
      console.log(sellerDevices.data.data);
    })();
  }, []);

  // Functions
  const equivalentDevices = (arr1, arr2) => {
    if (arr1.length !== arr2.length) {
      return false;
    }

    for (let i = 0; i < arr1.length; i++) {
      if (!helpers.compareObjects(arr1[i], arr2[i])) {
        return false;
      }
    }

    return true;
  };

  const handleUpdateDevices = async () => {
    let couldUpdateAllDevices = true;

    for (let i = 0; i < newDevices.length; i++) {
      let deviceUpdate = await axios.put(
        `http://${helpers.LOCALHOST_IP}:${helpers.TOMCAT_PORT}/sales-system/sellers?seller=${props.seller}&table=dispositivos&id=${newDevices[i].id_dispositivo}`,
        newDevices[i]
      );
      console.log(deviceUpdate.data);

      if (!deviceUpdate.data.success) {
        couldUpdateAllDevices = false;
        break;
      }
    }

    if (couldUpdateAllDevices) {
      setCatalogChanged(false);
      setDevices(newDevices);
      setNewDevices(newDevices);
      helpers.showModal(
        'Operación exitosa',
        'Se han actualizado los dispositivos.'
      );
    } else {
      helpers.showModal(
        'Error',
        'No se pudieron actualizar los dispositivos. Por favor, inténtelo de nuevo.'
      );
    }
  };

  useEffect(() => {
    console.log(newDevicesToAdd);
  }, [newDevicesToAdd]);

  const handleAddNewDeviceRow = () => {
    setNewDevicesToAdd([
      ...newDevicesToAdd,
      {
        categoria: '',
        codigo_modelo: '',
        color: '',
        descripcion: '',
        existencias: 0,
        id_dispositivo: devices.length + newDevicesToAdd.length + 1,
        id_marca: 1,
        id_vendedor:
          props.seller.toLowerCase() === 'max'
            ? 1
            : props.seller.toLowerCase() === 'Electronica'
            ? 2
            : 3,
        nombre: '',
        precio: 0,
        tiempo_garantia: 0,
      },
    ]);
  };

  const handlePostNewDevices = async () => {
    let devicesToAdd = [];

    for (let i = 0; i < newDevicesToAdd.length; i++) {
      console.log(newDevicesToAdd[i]);
      if (
        newDevicesToAdd[i].nombre !== '' &&
        newDevicesToAdd[i].descripcion !== '' &&
        newDevicesToAdd[i].existencias !== 0 &&
        newDevicesToAdd[i].precio !== 0 &&
        newDevicesToAdd[i].codigo_modelo !== '' &&
        newDevicesToAdd[i].color !== '' &&
        newDevicesToAdd[i].categoria !== '' &&
        newDevicesToAdd[i].tiempo_garantia !== 0
      ) {
        devicesToAdd.push(newDevicesToAdd[i]);
      }
    }

    if (devicesToAdd.length > 0) {
      for (let i = 0; i < devicesToAdd.length; i++) {
        let postDevice = await axios.post(
          `http://${helpers.LOCALHOST_IP}:${helpers.TOMCAT_PORT}/sales-system/sellers?seller=${props.seller}&table=dispositivos`,
          devicesToAdd[i]
        );
        console.log(postDevice.data);

        if (!postDevice.data.success) {
          helpers.showModal(
            'Error',
            'No se pudieron agregar los dispositivos. Por favor, inténtelo de nuevo.'
          );
          break;
        }
      }

      setNewDevicesToAdd([]);
      setDevices([...devices, ...devicesToAdd]);

      helpers.showModal(
        'Operación exitosa',
        'Se han agregado los dispositivos.'
      );
    } else {
      helpers.showModal(
        'No se pudieron agregar los dispositivos',
        'No hay suficientes datos para agregar los dispositivos Por favor, ingrese todos los datos solicitados.'
      );
    }
  };

  return (
    <section className="sales-catalog mt-4">
      <h4>{props.seller.charAt(0).toUpperCase() + props.seller.slice(1)}</h4>
      <section className="devices">
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Dispositivo</th>
              <th scope="col">Descripción</th>
              <th scope="col">Existencias</th>
              <th scope="col">Precio (Q.)</th>
              <th scope="col">Código de Modelo</th>
              <th scope="col">Color</th>
              <th scope="col">Categoría</th>
              <th scope="col">Años de Garantía</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => (
              <tr key={device.id_dispositivo}>
                <th scope="row">{device.id_dispositivo}</th>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue={device.nombre}
                    onChange={(e) => {
                      let potentialNewDevices = JSON.parse(
                        JSON.stringify(newDevices)
                      );
                      potentialNewDevices[device.id_dispositivo - 1].nombre =
                        e.target.value;
                      setNewDevices(potentialNewDevices);
                      if (!equivalentDevices(devices, potentialNewDevices)) {
                        setCatalogChanged(true);
                      } else {
                        setCatalogChanged(false);
                      }
                    }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue={device.descripcion}
                    onChange={(e) => {
                      let potentialNewDevices = JSON.parse(
                        JSON.stringify(newDevices)
                      );
                      potentialNewDevices[
                        device.id_dispositivo - 1
                      ].descripcion = e.target.value;
                      setNewDevices(potentialNewDevices);
                      if (!equivalentDevices(devices, potentialNewDevices)) {
                        setCatalogChanged(true);
                      } else {
                        setCatalogChanged(false);
                      }
                    }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    className="form-control"
                    defaultValue={device.existencias}
                    onChange={(e) => {
                      let potentialNewDevices = JSON.parse(
                        JSON.stringify(newDevices)
                      );
                      potentialNewDevices[
                        device.id_dispositivo - 1
                      ].existencias = Number(e.target.value);
                      setNewDevices(potentialNewDevices);
                      if (!equivalentDevices(devices, potentialNewDevices)) {
                        setCatalogChanged(true);
                      } else {
                        setCatalogChanged(false);
                      }
                    }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    className="form-control"
                    defaultValue={device.precio}
                    onChange={(e) => {
                      let potentialNewDevices = JSON.parse(
                        JSON.stringify(newDevices)
                      );
                      potentialNewDevices[device.id_dispositivo - 1].precio =
                        Number(e.target.value);
                      setNewDevices(potentialNewDevices);
                      if (!equivalentDevices(devices, potentialNewDevices)) {
                        setCatalogChanged(true);
                      } else {
                        setCatalogChanged(false);
                      }
                    }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue={device.codigo_modelo}
                    onChange={(e) => {
                      let potentialNewDevices = JSON.parse(
                        JSON.stringify(newDevices)
                      );
                      potentialNewDevices[
                        device.id_dispositivo - 1
                      ].codigo_modelo = e.target.value;
                      setNewDevices(potentialNewDevices);
                      if (!equivalentDevices(devices, potentialNewDevices)) {
                        setCatalogChanged(true);
                      } else {
                        setCatalogChanged(false);
                      }
                    }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue={device.color}
                    onChange={(e) => {
                      let potentialNewDevices = JSON.parse(
                        JSON.stringify(newDevices)
                      );
                      potentialNewDevices[device.id_dispositivo - 1].color =
                        e.target.value;
                      setNewDevices(potentialNewDevices);
                      if (!equivalentDevices(devices, potentialNewDevices)) {
                        setCatalogChanged(true);
                      } else {
                        setCatalogChanged(false);
                      }
                    }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue={device.categoria}
                    onChange={(e) => {
                      let potentialNewDevices = JSON.parse(
                        JSON.stringify(newDevices)
                      );
                      potentialNewDevices[device.id_dispositivo - 1].categoria =
                        e.target.value;
                      setNewDevices(potentialNewDevices);
                      if (!equivalentDevices(devices, potentialNewDevices)) {
                        setCatalogChanged(true);
                      } else {
                        setCatalogChanged(false);
                      }
                    }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    className="form-control"
                    defaultValue={device.tiempo_garantia}
                    onChange={(e) => {
                      let potentialNewDevices = JSON.parse(
                        JSON.stringify(newDevices)
                      );
                      potentialNewDevices[
                        device.id_dispositivo - 1
                      ].tiempo_garantia = Number(e.target.value);
                      setNewDevices(potentialNewDevices);
                      if (!equivalentDevices(devices, potentialNewDevices)) {
                        setCatalogChanged(true);
                      } else {
                        setCatalogChanged(false);
                      }
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!catalogChanged ? (
          <button className="btn btn-primary" disabled>
            Guardar Cambios
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleUpdateDevices}>
            Guardar Cambios
          </button>
        )}
      </section>
      <section className="new-devices">
        <h2 className="mt-5">Agregar Nuevo Dispositivo</h2>
        <button className="btn btn-primary" onClick={handleAddNewDeviceRow}>
          Nuevo Dispositivo
        </button>
        <table id="newDevicesTable" className="table table-striped">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Dispositivo</th>
              <th scope="col">Descripción</th>
              <th scope="col">Existencias</th>
              <th scope="col">Precio (Q.)</th>
              <th scope="col">Código de Modelo</th>
              <th scope="col">Color</th>
              <th scope="col">Categoría</th>
              <th scope="col">Años de Garantía</th>
            </tr>
          </thead>
          <tbody>
            {newDevicesToAdd.map((device) => (
              <tr key={device.id_dispositivo}>
                <th scope="row">{device.id_dispositivo}</th>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue={device.nombre}
                    onChange={(e) => {
                      let potentialNewDevices = JSON.parse(
                        JSON.stringify(newDevicesToAdd)
                      );
                      potentialNewDevices[
                        newDevicesToAdd.indexOf(device)
                      ].nombre = e.target.value;
                      setNewDevicesToAdd(potentialNewDevices);
                      if (e.target.value !== '') {
                        setCanAddNewDevices(true);
                      } else {
                        setCanAddNewDevices(false);
                      }
                    }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue={device.descripcion}
                    onChange={(e) => {
                      let potentialNewDevices = JSON.parse(
                        JSON.stringify(newDevicesToAdd)
                      );
                      potentialNewDevices[
                        newDevicesToAdd.indexOf(device)
                      ].descripcion = e.target.value;
                      setNewDevicesToAdd(potentialNewDevices);
                      if (e.target.value !== '') {
                        setCanAddNewDevices(true);
                      } else {
                        setCanAddNewDevices(false);
                      }
                    }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    className="form-control"
                    defaultValue={device.existencias}
                    onChange={(e) => {
                      let potentialNewDevices = JSON.parse(
                        JSON.stringify(newDevicesToAdd)
                      );
                      potentialNewDevices[
                        newDevicesToAdd.indexOf(device)
                      ].existencias = Number(e.target.value);
                      setNewDevicesToAdd(potentialNewDevices);
                      if (e.target.value !== '') {
                        setCanAddNewDevices(true);
                      } else {
                        setCanAddNewDevices(false);
                      }
                    }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    className="form-control"
                    defaultValue={device.precio}
                    onChange={(e) => {
                      let potentialNewDevices = JSON.parse(
                        JSON.stringify(newDevicesToAdd)
                      );
                      potentialNewDevices[
                        newDevicesToAdd.indexOf(device)
                      ].precio = Number(e.target.value);
                      setNewDevicesToAdd(potentialNewDevices);
                      if (e.target.value !== '') {
                        setCanAddNewDevices(true);
                      } else {
                        setCanAddNewDevices(false);
                      }
                    }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue={device.codigo_modelo}
                    onChange={(e) => {
                      let potentialNewDevices = JSON.parse(
                        JSON.stringify(newDevicesToAdd)
                      );
                      potentialNewDevices[
                        newDevicesToAdd.indexOf(device)
                      ].codigo_modelo = e.target.value;
                      setNewDevicesToAdd(potentialNewDevices);
                      if (e.target.value !== '') {
                        setCanAddNewDevices(true);
                      } else {
                        setCanAddNewDevices(false);
                      }
                    }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue={device.color}
                    onChange={(e) => {
                      let potentialNewDevices = JSON.parse(
                        JSON.stringify(newDevicesToAdd)
                      );
                      potentialNewDevices[
                        newDevicesToAdd.indexOf(device)
                      ].color = e.target.value;
                      setNewDevicesToAdd(potentialNewDevices);
                      if (e.target.value !== '') {
                        setCanAddNewDevices(true);
                      } else {
                        setCanAddNewDevices(false);
                      }
                    }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue={device.categoria}
                    onChange={(e) => {
                      let potentialNewDevices = JSON.parse(
                        JSON.stringify(newDevicesToAdd)
                      );
                      potentialNewDevices[
                        newDevicesToAdd.indexOf(device)
                      ].categoria = e.target.value;
                      setNewDevicesToAdd(potentialNewDevices);
                      if (e.target.value !== '') {
                        setCanAddNewDevices(true);
                      } else {
                        setCanAddNewDevices(false);
                      }
                    }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    className="form-control"
                    defaultValue={device.tiempo_garantia}
                    onChange={(e) => {
                      let potentialNewDevices = JSON.parse(
                        JSON.stringify(newDevicesToAdd)
                      );
                      potentialNewDevices[
                        newDevicesToAdd.indexOf(device)
                      ].tiempo_garantia = Number(e.target.value);
                      setNewDevicesToAdd(potentialNewDevices);
                      if (e.target.value !== '') {
                        setCanAddNewDevices(true);
                      } else {
                        setCanAddNewDevices(false);
                      }
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {newDevicesToAdd.length === 0 && !canAddNewDevices ? (
          <button className="btn btn-primary" disabled>
            Guardar Nuevos Dispositivos
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handlePostNewDevices}>
            Guardar Nuevos Dispositivos
          </button>
        )}
      </section>
    </section>
  );
}

export default SalesCatalogForm;

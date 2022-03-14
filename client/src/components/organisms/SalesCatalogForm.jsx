import axios from 'axios';
import React, { useState, useEffect } from 'react';
import helpers from '../../helpers/helpers';

function SalesCatalogForm(props) {
  // State
  const [devices, setDevices] = useState([]);
  const [newDevices, setNewDevices] = useState([]);
  const [catalogChanged, setCatalogChanged] = useState(false);
  const [newDevicesToAdd, setNewDevicesToAdd] = useState([]);

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
    </section>
  );
}

export default SalesCatalogForm;

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import helpers from '../../helpers/helpers';
import IndividualTextInput from './IndividualTextInput';

function ClientsList(props) {
  const [clients, setClients] = useState([]);
  const [newClientsData, setNewClientsData] = useState([]);
  const [canChangeData, setCanChangeData] = useState(false);
  const clientTypes = ['Individual', 'Grande', 'Distribuidor'];
  const suscriptionsOptions = ['Sí', 'No'];

  useEffect(async () => {
    const clientsList = await axios.get(
      `http://${helpers.LOCALHOST_IP}:${helpers.TOMCAT_PORT}/sales-system/sales?table=clientes`
    );
    setClients(clientsList.data.data);
    setNewClientsData(clientsList.data.data);
    props.setLoading(false);
  }, []);

  const handleUpdateClientsData = async () => {
    props.setLoading(true);
    let couldUpdateAllClients = true;

    // Iterate through the newClientsData array and update the clients data if they have changed
    for (let i = 0; i < newClientsData.length; i++) {
      if (!helpers.compareObjects(clients[i], newClientsData[i])) {
        let newUserData = {
          nombre:
            newClientsData[i].nombre !== null && newClientsData[i].nombre !== ''
              ? newClientsData[i].nombre
              : null,
          nit:
            newClientsData[i].nit !== null && newClientsData[i].nit !== ''
              ? newClientsData[i].nit
              : null,
          email:
            newClientsData[i].email !== null && newClientsData[i].email !== ''
              ? newClientsData[i].email
              : null,
          telefono:
            newClientsData[i].telefono !== null &&
            newClientsData[i].telefono !== ''
              ? newClientsData[i].telefono
              : null,
          patente_comercio:
            newClientsData[i].patente_comercio !== null &&
            newClientsData[i].patente_comercio !== ''
              ? newClientsData[i].patente_comercio
              : null,
          tipo_cliente:
            newClientsData[i].tipo_cliente !== null &&
            newClientsData[i].tipo_cliente !== ''
              ? newClientsData[i].tipo_cliente
              : null,
          tiene_suscripcion:
            newClientsData[i].tiene_suscripcion !== null &&
            newClientsData[i].tiene_suscripcion !== ''
              ? newClientsData[i].tiene_suscripcion
              : null,
          vencimiento_suscripcion:
            newClientsData[i].vencimiento_suscripcion !== null &&
            newClientsData[i].vencimiento_suscripcion !== ''
              ? newClientsData[i].vencimiento_suscripcion
              : null,
        };
        const updateClient = await axios.put(
          `http://${helpers.LOCALHOST_IP}:${helpers.TOMCAT_PORT}/sales-system/sales?table=clientes&id=${newClientsData[i].id_cliente}`,
          newUserData
        );

        if (!updateClient.data.success) {
          couldUpdateAllClients = false;
          break;
        }
      }
    }

    if (couldUpdateAllClients) {
      helpers.showModal(
        'Operación Exitosa',
        'Se han actualizado los datos de los clientes.'
      );
      setCanChangeData(false);
      setClients(newClientsData);
      setNewClientsData(newClientsData);
      props.setLoading(false);
    } else {
      helpers.showModal(
        'Error',
        'No se pudieron actualizar los datos de los clientes.'
      );
      props.setLoading(false);
    }
  };

  return !props.loading ? (
    <>
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Nombre</th>
            <th scope="col">NIT</th>
            <th scope="col">Email</th>
            <th scope="col">Teléfono</th>
            <th scope="col">Patente Comercio</th>
            <th scope="col">Tipo Cliente</th>
            <th scope="col">¿Tiene Suscripción?</th>
            <th scope="col">Vencimiento Suscripción</th>
          </tr>
        </thead>
        <tbody>
          {newClientsData.map((client, index) => (
            <tr key={index}>
              <th scope="row">{index + 1}</th>
              <td>
                <IndividualTextInput
                  placeholder="Nombre"
                  label={client.nombre}
                  value={client.nombre}
                  type="text"
                  onChangeCallback={(e) => {
                    let potentialNewClients = JSON.parse(
                      JSON.stringify(newClientsData)
                    );
                    potentialNewClients[index].nombre = e.target.value;
                    setNewClientsData(potentialNewClients);
                    if (!helpers.compareObjects(clients, potentialNewClients)) {
                      setCanChangeData(true);
                    } else {
                      setCanChangeData(false);
                    }
                  }}
                />
              </td>
              <td>
                <IndividualTextInput
                  placeholder="NIT"
                  label={client.nit}
                  value={client.nit || ''}
                  type="text"
                  onChangeCallback={(e) => {
                    let potentialNewClients = JSON.parse(
                      JSON.stringify(newClientsData)
                    );
                    potentialNewClients[index].nit = e.target.value;
                    setNewClientsData(potentialNewClients);
                    if (!helpers.compareObjects(clients, potentialNewClients)) {
                      setCanChangeData(true);
                    } else {
                      setCanChangeData(false);
                    }
                  }}
                />
              </td>
              <td>
                <IndividualTextInput
                  placeholder="Email"
                  label={client.email}
                  value={client.email || ''}
                  type="email"
                  onChangeCallback={(e) => {
                    let potentialNewClients = JSON.parse(
                      JSON.stringify(newClientsData)
                    );
                    potentialNewClients[index].email = e.target.value;
                    setNewClientsData(potentialNewClients);
                    if (!helpers.compareObjects(clients, potentialNewClients)) {
                      setCanChangeData(true);
                    } else {
                      setCanChangeData(false);
                    }
                  }}
                />
              </td>
              <td>
                <IndividualTextInput
                  placeholder="Teléfono"
                  label={client.telefono}
                  value={client.telefono || ''}
                  type="text"
                  onChangeCallback={(e) => {
                    let potentialNewClients = JSON.parse(
                      JSON.stringify(newClientsData)
                    );
                    potentialNewClients[index].telefono = e.target.value;
                    setNewClientsData(potentialNewClients);
                    if (!helpers.compareObjects(clients, potentialNewClients)) {
                      setCanChangeData(true);
                    } else {
                      setCanChangeData(false);
                    }
                  }}
                />
              </td>
              <td>
                {client.patente_comercio !== null ? (
                  <img
                    className="img-fluid"
                    src={`http://${helpers.LOCALHOST_IP}${client.patente_comercio}`}
                    alt="Patente de Comercio"
                    style={{ width: '150px' }}
                  />
                ) : (
                  <></>
                )}
              </td>
              <td>
                <select
                  className="form-control"
                  value={clientTypes.indexOf(client.tipoCliente)}
                  onChange={(e) => {
                    let potentialNewClients = JSON.parse(
                      JSON.stringify(newClientsData)
                    );
                    potentialNewClients[index].tipo_cliente =
                      clientTypes[e.target.value].toLowerCase();
                    setNewClientsData(potentialNewClients);
                    if (!helpers.compareObjects(clients, potentialNewClients)) {
                      setCanChangeData(true);
                    } else {
                      setCanChangeData(false);
                    }
                  }}
                >
                  {clientTypes.map((type, index) => (
                    <option key={index} value={index}>
                      {type}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <select
                  className="form-control"
                  value={suscriptionsOptions.indexOf(
                    client.tiene_suscripcion === 'True' ? 'Sí' : 'No'
                  )}
                  onChange={(e) => {
                    let potentialNewClients = JSON.parse(
                      JSON.stringify(newClientsData)
                    );
                    potentialNewClients[index].tiene_suscripcion =
                      suscriptionsOptions[e.target.value];
                    setNewClientsData(potentialNewClients);
                    if (!helpers.compareObjects(clients, potentialNewClients)) {
                      setCanChangeData(true);
                    } else {
                      setCanChangeData(false);
                    }
                  }}
                >
                  {suscriptionsOptions.map((option, index) => (
                    <option key={index} value={index}>
                      {option}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="date"
                  className="form-control"
                  value={
                    client.vencimiento_suscripcion !== null
                      ? client.vencimiento_suscripcion.split(' ')[0]
                      : ''
                  }
                  onChange={(e) => {
                    let potentialNewClients = JSON.parse(
                      JSON.stringify(newClientsData)
                    );
                    potentialNewClients[index].vencimiento_suscripcion =
                      e.target.value + ' ' + client.vencimiento_suscripcion.split(' ')[1];
                    setNewClientsData(potentialNewClients);
                    if (!helpers.compareObjects(clients, potentialNewClients)) {
                      setCanChangeData(true);
                    } else {
                      setCanChangeData(false);
                    }
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!canChangeData ? (
        <button className="btn btn-primary" disabled>
          Guardar Cambios
        </button>
      ) : (
        <button className="btn btn-primary" onClick={handleUpdateClientsData}>
          Guardar Cambios
        </button>
      )}
    </>
  ) : (
    <></>
  );
}

export default ClientsList;

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import helpers from '../../helpers/helpers';
import IndividualTextInput from './IndividualTextInput';
import secrets from '../../helpers/secrets';

function ClientsList(props) {
  const [clients, setClients] = useState([]);
  const [newClients, setNewClients] = useState([]);
  const [canChangeData, setCanChangeData] = useState(false);
  const [factoryId, setFactoryId] = useState(0);

  useEffect(async () => {
    const clients = await axios.get(
      `http://${secrets.LOCALHOST_IP}:${secrets.FACTORIES_BACKEND_PORT}/clients`
    );
    setClients(clients.data.data);
    setNewClients(clients.data.data);
    setFactoryId(localStorage.getItem('id'));
    props.setLoading(false);
  }, []);

  const compareShippingTimes = (a, b) => {
    if (a.length !== b.length) {
      return false;
    }

    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < a[i].shippingTimes.length; j++) {
        if (a[i].shippingTimes[j].factoryId === factoryId) {
          if (
            !helpers.compareObjects(
              a[i].shippingTimes[j],
              b[i].shippingTimes[j]
            )
          ) {
            return false;
          }
        }
      }
    }

    return true;
  };

  const compareIndividualShippingTimes = (a, b) => {
    if (a.length !== b.length) {
      return false;
    }

    for (let i = 0; i < a.length; i++) {
      if (!helpers.compareObjects(a[i], b[i])) {
        return false;
      }
    }

    return true;
  };

  const handleUpdateClientsData = async () => {
    props.setLoading(true);
    let couldUpdateAll = true;

    // Iterate through the clients array and update the ones that were changed
    for (let i = 0; i < clients.length; i++) {
      if (
        !compareIndividualShippingTimes(
          clients[i].shippingTimes,
          newClients[i].shippingTimes
        )
      ) {
        const updateClientRes = await axios.put(
          `http://${secrets.LOCALHOST_IP}:${secrets.FACTORIES_BACKEND_PORT}/clients/${clients[i].name}`,
          newClients[i]
        );

        if (!updateClientRes.data.success) {
          couldUpdateAll = false;
        }
      }
    }

    if (couldUpdateAll) {
      setClients(newClients);
      setNewClients(newClients);
      setCanChangeData(false);
      props.setLoading(false);
      helpers.showModal(
        'Operacion exitosa',
        'Los tiempos de envío de los clientes han sido actualizados.'
      );
    } else {
      props.setLoading(false);
      helpers.showModal(
        'Error',
        'Hubo un error al actualizar los tiempos de envío de los clientes. Por favor, inténlo de nuevo.'
      );
    }
  };

  return !props.loading ? (
    <section className="clients-section">
      <table className="table table-striped mt-3">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Correo electrónico</th>
            <th scope="col">Nombre</th>
            <th scope="col">Tiempo de envío (días)</th>
          </tr>
        </thead>
        <tbody>
          {newClients.map((client, index) => (
            <tr key={index}>
              <th scope="row">{index + 1}</th>
              <td>{client.email}</td>
              <td>{client.name}</td>
              <td>
                <input
                  type="number"
                  className="form-control text-input"
                  min={0}
                  value={
                    client.shippingTimes.find(
                      (shippingTime) => shippingTime.factoryId === factoryId
                    ).shippingTime
                  }
                  onChange={(e) => {
                    const potentialNewShippingTimes = JSON.parse(
                      JSON.stringify(newClients[index].shippingTimes)
                    );
                    potentialNewShippingTimes.find(
                      (shippingTime) => shippingTime.factoryId === factoryId
                    ).shippingTime = Number(e.target.value);
                    const potentialNewClientData = JSON.parse(
                      JSON.stringify(newClients)
                    );
                    potentialNewClientData[index].shippingTimes =
                      potentialNewShippingTimes;
                    setNewClients(potentialNewClientData);
                    setCanChangeData(
                      !compareShippingTimes(clients, potentialNewClientData)
                    );
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {canChangeData ? (
        <button
          className="btn btn-primary mt-3"
          onClick={handleUpdateClientsData}
          style={{
            width: '100%',
          }}
        >
          Actualizar tiempos de envío
        </button>
      ) : (
        <button
          className="btn btn-primary disabled-btn mt-3"
          disabled
          style={{
            width: '100%',
          }}
        >
          Tiempos de envío sin cambios
        </button>
      )}
    </section>
  ) : (
    <></>
  );
}

export default ClientsList;


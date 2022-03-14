import axios from 'axios';
import React, { useState, useEffect } from 'react';
import helpers from '../../helpers/helpers';

function UserProfile() {
  // State
  const [userData, setUserData] = useState({});
  const [newUserData, setNewUserData] = useState({});
  const userId = 1;

  useEffect(() => {
    (async () => {
      let userData = await axios.get(
        `http://${helpers.LOCALHOST_IP}:${helpers.TOMCAT_PORT}/sales-system/sales?table=clientes&id=${userId}`
      );
      console.log(userData.data.data);
      let oldUserData = JSON.parse(JSON.stringify(userData.data.data));
      setUserData(userData.data.data);
      setNewUserData(oldUserData);
    })();
  }, []);

  useEffect(() => {
    console.log(newUserData);
  }, [newUserData]);

  const handleSaveChanges = async () => {
    if (newUserData.nombre !== '') {
      // Attempt to update the user's data
      let updateUserData = await axios.put(
        `http://${helpers.LOCALHOST_IP}:${helpers.TOMCAT_PORT}/sales-system/sales?table=clientes&id=${userId}`,
        newUserData
      );
      console.log(updateUserData.data);

      if (updateUserData.data.success) {
        setUserData(newUserData);
        setNewUserData(newUserData);
        helpers.showModal(
          'Operación exitosa',
          'Sus datos de usuario han sido actualizados.'
        );
      }
    }
  };

  return Object.keys(userData).length === 0 ? (
    <></>
  ) : (
    <>
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">Propiedad</th>
            <th scope="col">Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Nombre</th>
            <td>
              <input
                className="form-control"
                type="text"
                defaultValue={userData.nombre}
                onChange={(e) => {
                  let potentialUserData = JSON.parse(
                    JSON.stringify(newUserData)
                  );
                  potentialUserData.nombre = e.target.value;
                  setNewUserData(potentialUserData);
                }}
              />
            </td>
          </tr>
          <tr>
            <th scope="row">Tipo de cliente</th>
            <td>
              <select
                name="clientTypeSelect"
                id="clientTypeSelect"
                className="form-control"
                defaultValue={
                  userData.tipo_cliente === 'individual'
                    ? 'individual'
                    : userData.tipo_cliente === 'grande'
                    ? 'grande'
                    : 'distribuidor'
                }
                onChange={(e) => {
                  let potentialUserData = JSON.parse(
                    JSON.stringify(newUserData)
                  );
                  potentialUserData.tipo_cliente = e.target.value;
                  setNewUserData(potentialUserData);
                }}
              >
                <option value="individual">Individual</option>
                <option value="grande">Gran Cliente</option>
                <option value="distribuidor">Distribuidor</option>
              </select>
            </td>
          </tr>
          <tr>
            <th scope="row">Email</th>
            <td>
              <input
                className="form-control"
                type="text"
                defaultValue={
                  userData.email !== null && userData.email !== undefined
                    ? userData.email
                    : ''
                }
                onChange={(e) => {
                  let potentialUserData = JSON.parse(
                    JSON.stringify(newUserData)
                  );
                  potentialUserData.email = e.target.value;
                  setNewUserData(potentialUserData);
                }}
              />
            </td>
          </tr>
          <tr>
            <th scope="row">Teléfono</th>
            <td>
              <input
                className="form-control"
                type="text"
                defaultValue={
                  userData.telefono !== null && userData.telefono !== undefined
                    ? userData.telefono
                    : ''
                }
                onChange={(e) => {
                  let potentialUserData = JSON.parse(
                    JSON.stringify(newUserData)
                  );
                  potentialUserData.telefono = e.target.value;
                  setNewUserData(potentialUserData);
                }}
              />
            </td>
          </tr>
          <tr>
            <th scope="row">NIT</th>
            <td>
              <input
                className="form-control"
                type="text"
                defaultValue={
                  userData.nit !== null && userData.nit !== undefined
                    ? userData.nit
                    : ''
                }
                onChange={(e) => {
                  let potentialUserData = JSON.parse(
                    JSON.stringify(newUserData)
                  );
                  potentialUserData.nit =
                    e.target.value !== '' ? e.target.value : null;
                  setNewUserData(potentialUserData);
                }}
              />
            </td>
          </tr>
          <tr>
            <th scope="row">Pat. de Com.</th>
            <td>
              {userData.patente_comercio !== null &&
              userData.patente_comercio !== undefined ? (
                <img
                  src={
                    userData.patente_comercio.substring(0, 22) !==
                    'data:image/png;base64,'
                      ? `data:image/png;base64,${userData.patente_comercio}`
                      : userData.patente_comercio
                  }
                  style={{
                    // Center the image
                    display: 'block',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    // width: '100%',
                  }}
                  alt="Patente de Comercio"
                />
              ) : (
                <></>
              )}
              <input
                className="form-control"
                type="file"
                onChange={(e) => {
                  let potentialUserData = JSON.parse(
                    JSON.stringify(newUserData)
                  );
                  // Check if a file was selected
                  if (e.target.files[0]) {
                    let file = e.target.files[0];
                    (async () => {
                      potentialUserData.patente_comercio =
                        await helpers.getBase64(file);
                      setNewUserData(potentialUserData);
                    })();
                  } else {
                    potentialUserData.patente_comercio =
                      userData.patente_comercio;
                    setNewUserData(potentialUserData);
                  }
                }}
              />
            </td>
          </tr>
          <tr>
            <th scope="row">¿Tiene suscripción?</th>
            <td>
              <select
                name="clientTypeSelect"
                id="clientTypeSelect"
                className="form-control"
                defaultValue={
                  userData.tiene_suscripcion === null ||
                  userData.tiene_suscripcion === undefined
                    ? false
                    : userData.tiene_suscripcion
                }
                onChange={(e) => {
                  let potentialUserData = JSON.parse(
                    JSON.stringify(newUserData)
                  );
                  potentialUserData.tiene_suscripcion =
                    e.target.value === 'True' ? 'True' : 'False';
                  setNewUserData(potentialUserData);
                }}
              >
                <option value="True">Sí</option>
                <option value="False">No</option>
              </select>
            </td>
          </tr>
          <tr>
            <th scope="row">Vencimiento suscripción</th>
            <td>
              <input
                className="form-control"
                type="date"
                defaultValue={
                  userData.vencimiento_suscripcion !== undefined
                    ? userData.vencimiento_suscripcion
                    : null
                }
                onChange={(e) => {
                  let potentialUserData = JSON.parse(
                    JSON.stringify(newUserData)
                  );
                  potentialUserData.vencimiento_suscripcion = e.target.value;
                  setNewUserData(potentialUserData);
                }}
              />
            </td>
          </tr>
        </tbody>
      </table>
      {helpers.compareObjects(userData, newUserData) ? (
        <button className="btn btn-primary" disabled>
          Guardar Cambios
        </button>
      ) : (
        <button className="btn btn-primary" onClick={handleSaveChanges}>
          Guardar Cambios
        </button>
      )}
    </>
  );
}

export default UserProfile;

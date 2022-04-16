import axios from 'axios';
import React, { useState, useEffect } from 'react';
import helpers from '../../helpers/helpers';
import secrets from '../../helpers/secrets';

function UserProfile(props) {
  const [userData, setUserData] = useState({});
  const [newUserData, setNewUserData] = useState({});
  const [clientComPat, setClientComPat] = useState(new Blob());
  const [changedPatent, setChangedPatent] = useState(false);
  const [isUserTypeSet, setIsUserTypeSet] = useState(false);

  useEffect(async () => {
    let user;

    if (localStorage.getItem('userType') !== 'vendedor') {
      user = await axios.get(
        `http://${secrets.LOCALHOST_IP}:${
          secrets.TOMCAT_PORT
        }/sales-system/sales?table=clientes&id=${Number(
          localStorage.getItem('userId')
        )}`
      );
    } else {
      user = await axios.get(
        `http://${secrets.LOCALHOST_IP}:${
          secrets.TOMCAT_PORT
        }/sales-system/sales?table=vendedores&id=${Number(
          localStorage.getItem('userId')
        )}`
      );
    }

    let oldUserData = JSON.parse(JSON.stringify(user.data.data));
    setUserData(user.data.data);
    setNewUserData(oldUserData);
    setIsUserTypeSet(localStorage.getItem('userType'));
    props.setLoading(false);
  }, []);

  const handleSaveChanges = async () => {
    props.setLoading(true);
    if (isUserTypeSet !== 'vendedor') {
      if (newUserData.nombre !== '') {
        // Attempt to update the user's data
        let formData = new FormData();
        formData.append(
          'fileName',
          `${helpers.replaceWhiteSpaces(
            userData.nombre,
            '-'
          )}-${Date.now()}-commerce-patent.jpg`
        );
        formData.append('commerce-patent', clientComPat);
        let clientCommercePatentUpload = await axios.post(
          `http://${secrets.LOCALHOST_IP}:3001/upload-commerce-patent`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        let uploadUserData = { ...newUserData };

        // Check if the user uploaded a new commerce patent
        if (clientComPat.size !== 0) {
          uploadUserData = {
            ...uploadUserData,
            patente_comercio:
              ':' + clientCommercePatentUpload.data.imgURL.split(':')[2],
          };
          const commercePatentImgURL = userData.patente_comercio;
          const commercePatentName =
            commercePatentImgURL.split('/')[
              commercePatentImgURL.split('/').length - 1
            ];
          let deleteOldComPat = await axios.delete(
            `http://${secrets.LOCALHOST_IP}:${secrets.IMAGES_SERVER}/delete-commerce-patent/${commercePatentName}`
          );
          let successfullyDeleted = deleteOldComPat.data.success;

          while (!successfullyDeleted) {
            deleteOldComPat = await axios.delete(
              `http://${secrets.LOCALHOST_IP}:${secrets.IMAGES_SERVER}/delete-commerce-patent/${commercePatentName}`
            );
            successfullyDeleted = deleteOldComPat.data.success;
          }
        }

        let updateUserData = await axios.put(
          `http://${secrets.LOCALHOST_IP}:${
            secrets.TOMCAT_PORT
          }/sales-system/sales?table=clientes&id=${Number(
            localStorage.getItem('userId')
          )}`,
          uploadUserData
        );

        if (updateUserData.data.success && updateUserData.data.success) {
          props.setLoading(false);
          setUserData(uploadUserData);
          setNewUserData(uploadUserData);
          helpers.showModal(
            'Operación exitosa',
            'Sus datos de usuario han sido actualizados.'
          );
        }
      }
    } else {
      if (newUserData.nombre !== '') {
        // Attempt to update the user's data
        let updateUserData = await axios.put(
          `http://${secrets.LOCALHOST_IP}:${
            secrets.TOMCAT_PORT
          }/sales-system/sales?table=vendedores&id=${Number(
            localStorage.getItem('userId')
          )}`,
          newUserData
        );

        if (updateUserData.data.success && updateUserData.data.success) {
          props.setLoading(false);
          setUserData(newUserData);
          setNewUserData(newUserData);
          helpers.showModal(
            'Operación exitosa',
            'Sus datos de usuario han sido actualizados.'
          );
        }
      }
    }
  };

  return Object.keys(userData).length === 0 ? (
    <></>
  ) : isUserTypeSet && isUserTypeSet !== 'vendedor' ? (
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
            <th scope="row">Patente de Comercio</th>
            <td>
              {userData.patente_comercio !== null &&
              userData.patente_comercio !== undefined ? (
                <img
                  src={`http://${secrets.LOCALHOST_IP}${userData.patente_comercio}`}
                  style={{
                    display: 'block',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    height: '300px',
                    width: 'auto',
                    marginTop: '25px',
                    marginBottom: '25px',
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
                  setClientComPat(e.target.files[0]);
                  setChangedPatent(true);
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
                  userData.vencimiento_suscripcion !== undefined &&
                  userData.vencimiento_suscripcion !== null
                    ? new Date(userData.vencimiento_suscripcion)
                        .toISOString()
                        .slice(0, 10)
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
      {helpers.compareObjects(userData, newUserData) && !changedPatent ? (
        <button className="btn btn-primary" disabled>
          Guardar Cambios
        </button>
      ) : (
        <button className="btn btn-primary" onClick={handleSaveChanges}>
          Guardar Cambios
        </button>
      )}
    </>
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
        </tbody>
      </table>
      {helpers.compareObjects(userData, newUserData) && !changedPatent ? (
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


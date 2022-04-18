import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
          secrets.FACTORIES_BACKEND_PORT
        }/factories/${localStorage.getItem('id')}`
      );
    } else {
      user = await axios.get(
        `http://${secrets.LOCALHOST_IP}:${
          secrets.FACTORIES_BACKEND_PORT
        }/clients/${localStorage.getItem('name')}`
      );
    }

    let oldUserData = JSON.parse(JSON.stringify(user.data.data));
    setUserData(user.data.data);
    setNewUserData(oldUserData);
    setIsUserTypeSet(localStorage.getItem('userType'));
    props.setLoading(false);
  }, []);

  const handleSaveChanges = async () => {
    // props.setLoading(true);
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
            <td>{userData.name}</td>
          </tr>
          <tr>
            <th scope="row">Email</th>
            <td>{userData.email}</td>
          </tr>
          <tr>
            <th scope="row">Reportes de ventas</th>
            <td>
              <Link to={`/reportes-ventas/${userData._id}`}>
                {`http://${secrets.LOCALHOST_IP}:${secrets.FACTORIES_FRONTEND_PORT}/reportes-ventas/${userData._id}`}
              </Link>
            </td>
          </tr>
        </tbody>
      </table>
      {/* {helpers.compareObjects(userData, newUserData) && !changedPatent ? (
        <button className="btn btn-primary" disabled>
          Guardar Cambios
        </button>
      ) : (
        <button className="btn btn-primary" onClick={handleSaveChanges}>
          Guardar Cambios
        </button>
      )} */}
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
            <td>{userData.name}</td>
          </tr>
          <tr>
            <th scope="row">Correo</th>
            <td>{userData.email}</td>
          </tr>
        </tbody>
      </table>
      {/* {helpers.compareObjects(userData, newUserData) && !changedPatent ? (
        <button className="btn btn-primary" disabled>
          Guardar Cambios
        </button>
      ) : (
        <button className="btn btn-primary" onClick={handleSaveChanges}>
          Guardar Cambios
        </button>
      )} */}
    </>
  );
}

export default UserProfile;


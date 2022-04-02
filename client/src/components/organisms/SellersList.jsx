import axios from 'axios';
import React, { useEffect, useState } from 'react';
import helpers from '../../helpers/helpers';
import secrets from '../../helpers/secrets';

function SellersList(props) {
  const [sellers, setSellers] = useState([]);
  const [newSellersData, setNewSellersData] = useState([]);
  const [canChangeData, setCanChangeData] = useState(false);
  const isAdminOptions = ['Sí', 'No'];

  useEffect(async () => {
    const sellersList = await axios.get(
      `http://${secrets.LOCALHOST_IP}:${secrets.TOMCAT_PORT}/sales-system/sales?table=vendedores`
    );
    setSellers(sellersList.data.data);
    setNewSellersData(sellersList.data.data);
    props.setLoading(false);
  }, []);

  const handleUpdateSellersData = async () => {
    props.setLoading(true);
    let couldUpdateAllSellers = true;

    // Iterate through the newSellersData array and update the sellers data if they have changed
    for (let i = 0; i < newSellersData.length; i++) {
      if (!helpers.compareObjects(sellers[i], newSellersData[i])) {
        let newUserData = {
          nombre: newSellersData[i].nombre,
          es_admin: newSellersData[i].es_admin,
        };
        const updateSeller = await axios.put(
          `http://${secrets.LOCALHOST_IP}:${secrets.TOMCAT_PORT}/sales-system/sales?table=vendedores&id=${newSellersData[i].id_vendedor}`,
          newUserData
        );

        if (!updateSeller.data.success) {
          couldUpdateAllSellers = false;
          break;
        }
      }
    }

    if (couldUpdateAllSellers) {
      helpers.showModal(
        'Operación Exitosa',
        'Se han actualizado los datos de los vendedores.'
      );
      setCanChangeData(false);
      setSellers(newSellersData);
      setNewSellersData(newSellersData);
      props.setLoading(false);
    } else {
      helpers.showModal(
        'Error',
        'No se pudieron actualizar los datos de los vendedores.'
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
            <th scope="col">¿Es administrador?</th>
          </tr>
        </thead>
        <tbody>
          {newSellersData.map((seller, index) => (
            <tr key={index}>
              <th scope="row">{index + 1}</th>
              <td>{seller.nombre}</td>
              <td>
                {index + 1 === Number(localStorage.getItem('userId')) ? (
                  isAdminOptions[
                    isAdminOptions.findIndex(
                      (option) =>
                        option === (seller.es_admin === 'True' ? 'Sí' : 'No')
                    )
                  ] === 'Sí' ? (
                    <>Sí</>
                  ) : (
                    <>No</>
                  )
                ) : (
                  <select
                    className="form-control"
                    value={
                      isAdminOptions[
                        isAdminOptions.findIndex(
                          (option) =>
                            option ===
                            (seller.es_admin === 'True' ? 'Sí' : 'No')
                        )
                      ]
                    }
                    onChange={(e) => {
                      let potentialNewSellers = JSON.parse(
                        JSON.stringify(newSellersData)
                      );
                      potentialNewSellers[index].es_admin =
                        e.target.value === 'Sí' ? 'True' : 'False';
                      setNewSellersData(potentialNewSellers);
                      setCanChangeData(
                        !helpers.compareObjects(sellers, potentialNewSellers)
                      );
                    }}
                  >
                    {isAdminOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                )}
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
        <button className="btn btn-primary" onClick={handleUpdateSellersData}>
          Guardar Cambios
        </button>
      )}
    </>
  ) : (
    <></>
  );
}

export default SellersList;


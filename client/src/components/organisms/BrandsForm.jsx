import axios from 'axios';
import React, { useState, useEffect } from 'react';
import helpers from '../../helpers/helpers';
import IndividualTextInput from './IndividualTextInput';

function SalesCatalogForm(props) {
  const [brands, setBrands] = useState([]);
  const [newBrands, setNewBrands] = useState([]);
  const [brandsChanged, setBrandsChanged] = useState(false);
  const [newBrandsToAdd, setNewBrandsToAdd] = useState([]);
  const [canAddNewBrands, setCanAddNewBrands] = useState(false);
  const [seller, setSeller] = useState({});

  useEffect(async () => {
    const brands = await axios.get(
      `http://${helpers.LOCALHOST_IP}:${helpers.TOMCAT_PORT}/sales-system/sales?table=marcas`
    );
    setBrands(brands.data.data);
    setNewBrands(brands.data.data);
    setSeller({
      id: localStorage.getItem('userId'),
      sellerName: localStorage.getItem('userName'),
    });
    props.setLoading(false);
  }, []);

  const handleUpdateBrands = async () => {
    props.setLoading(true);
    let couldUpdateAllBrands = true;

    for (let i = 0; i < newBrands.length; i++) {
      if (!helpers.compareObjects(newBrands[i], brands[i])) {
        let brandUpdate = await axios.put(
          `http://${helpers.LOCALHOST_IP}:${helpers.TOMCAT_PORT}/sales-system/sales?table=marcas&id=${newBrands[i].id_marca}`,
          newBrands[i]
        );

        if (!brandUpdate.data.success) {
          couldUpdateAllBrands = false;
          break;
        }
      }
    }

    if (couldUpdateAllBrands) {
      setBrandsChanged(false);
      setBrands(newBrands);
      setNewBrands(newBrands);
      props.setLoading(false);
      helpers.showModal('Operación exitosa', 'Se han actualizado las marcas.');
    } else {
      props.setLoading(false);
      helpers.showModal(
        'Error',
        'No se pudieron actualizar las marcas. Por favor, inténtelo de nuevo.'
      );
    }
  };

  const handleAddNewBrandRow = () => {
    setNewBrandsToAdd([
      ...newBrandsToAdd,
      {
        nombre: '',
      },
    ]);
  };

  const handlePostNewBrands = async () => {
    props.setLoading(true);
    let devicesToAdd = [];
    let enoughData;

    for (let i = 0; i < newBrandsToAdd.length; i++) {
      if (newBrandsToAdd[i].nombre !== '') {
        devicesToAdd.push(newBrandsToAdd[i]);
        enoughData = true;
      } else {
        enoughData = false;
        break;
      }
    }

    if (!enoughData) {
      props.setLoading(false);
      helpers.showModal(
        'No se pudieron agregar las marcas',
        'No hay suficientes datos para agregar las marcas Por favor, ingrese todos los datos solicitados.'
      );
    } else {
      for (let i = 0; i < devicesToAdd.length; i++) {
        let postBrand = await axios.post(
          `http://${helpers.LOCALHOST_IP}:${helpers.TOMCAT_PORT}/sales-system/sales?table=marcas`,
          devicesToAdd[i]
        );

        if (!postBrand.data.success) {
          props.setLoading(false);
          helpers.showModal(
            'Error',
            'No se pudieron agregar las marcas. Por favor, inténtelo de nuevo.'
          );
          break;
        }
      }

      setNewBrandsToAdd([]);
      setBrands([...brands, ...newBrandsToAdd]);
      setNewBrands([...brands, ...newBrandsToAdd]);
      props.setLoading(false);
      helpers.showModal(
        'Operación exitosa',
        'Se han agregado las marcas.'
      );
    }
  };

  return !props.loading ? (
    <section className="sales-catalog mt-4">
      <section className="devices">
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Nombre</th>
            </tr>
          </thead>
          <tbody>
            {newBrands.map((brand, index) => (
              <tr key={index}>
                <th scope="row">{index + 1}</th>
                <td>
                  <IndividualTextInput
                    type="text"
                    label={brand.nombre}
                    value={brand.nombre}
                    onChangeCallback={(e) => {
                      let potentialNewBrands = JSON.parse(
                        JSON.stringify(newBrands)
                      );
                      potentialNewBrands[index].nombre = e.target.value;
                      setNewBrands(potentialNewBrands);
                      setBrandsChanged(
                        !helpers.compareArrays(potentialNewBrands, brands)
                      );
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!brandsChanged ? (
          <button className="btn btn-primary" disabled>
            Guardar Cambios
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleUpdateBrands}>
            Guardar Cambios
          </button>
        )}
      </section>
      <section className="new-devices">
        <h2 className="mt-5">Agregar Nueva Marca</h2>
        <button className="btn btn-primary" onClick={handleAddNewBrandRow}>
          Nueva Marca
        </button>
        <table id="newDevicesTable" className="table table-striped">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Nombre</th>
            </tr>
          </thead>
          <tbody>
            {newBrandsToAdd.map((brand, index) => (
              <tr key={index}>
                <th scope="row">{index + 1}</th>
                <td>
                  <IndividualTextInput
                    type="text"
                    label={brand.nombre}
                    value={brand.nombre}
                    onChangeCallback={(e) => {
                      let potentialNewBrandsToAdd = JSON.parse(
                        JSON.stringify(newBrandsToAdd)
                      );
                      potentialNewBrandsToAdd[index].nombre = e.target.value;
                      setNewBrandsToAdd(potentialNewBrandsToAdd);
                      setCanAddNewBrands(
                        !helpers.compareArrays(
                          potentialNewBrandsToAdd,
                          newBrandsToAdd
                        )
                      );
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {newBrandsToAdd.length === 0 && !canAddNewBrands ? (
          <button className="btn btn-primary" disabled>
            Guardar Nuevas Marcas
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handlePostNewBrands}>
            Guardar Nuevas Marcas
          </button>
        )}
      </section>
    </section>
  ) : (
    <></>
  );
}

export default SalesCatalogForm;

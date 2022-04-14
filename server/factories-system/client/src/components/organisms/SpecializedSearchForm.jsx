import axios from 'axios';
import React, { useEffect, useState } from 'react';
import helpers from '../../helpers/helpers';
import { useNavigate } from 'react-router-dom';
import TextInput from './TextInput';
import NumberInput from './NumberInput';
import secrets from '../../helpers/secrets';

function SpecializedSearchForm(props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [factoryId, setFactoryId] = useState(0);
  const [availableFactories, setAvailableFactories] = useState([]);
  const [price, setprice] = useState(-1);
  const [modelCode, setModelCode] = useState('');
  const [color, setColor] = useState('');
  const [category, setCategory] = useState('');
  const [warranty, setWarranty] = useState(-1);
  const navigate = useNavigate();

  useEffect(async () => {
    // Set the available factories
    const listedFactories = await axios.get(
      `http://${secrets.LOCALHOST_IP}:${secrets.FACTORIES_BACKEND_PORT}/factories`
    );
    const factories = listedFactories.data.data;
    setAvailableFactories([
      { id_factory: 0, name: 'Todas las fábricas' },
      ...factories.map((factory) => ({
        id_factory: factory._id,
        name: factory.name,
      })),
    ]);
    props.setLoading(false);
  }, []);

  const handleDevicesSearchSubmission = async () => {
    if (
      name === '' &&
      description === '' &&
      factoryId === 0 &&
      price === -1 &&
      modelCode === '' &&
      color === '' &&
      category === '' &&
      warranty === -1
    ) {
      navigate('/catalogo-dispositivos');
    } else {
      let deviceSearch = {
        ...(factoryId !== 0 && { factoryId }),
        ...(name !== '' && { name }),
        ...(description !== '' && { description }),
        ...(price !== -1 && { price }),
        ...(modelCode !== '' && { model_code: modelCode }),
        ...(color !== '' && { color }),
        ...(category !== '' && { category }),
        ...(warranty !== -1 && { warranty_time: warranty }),
      };

      navigate('/catalogo-dispositivos-busqueda', {
        state: {
          searchParams: deviceSearch,
        },
      });
    }
  };

  return (
    <form className="device-search-form">
      <h1 className="h3 mt-2 mb-4 font-weight-normal text-center">
        Búsqueda de Dispositivos
      </h1>
      <div className="search-param-columns">
        <div className="search-param-column">
          <TextInput
            label="deviceName"
            placeholder="Nombre del Dispositivo"
            required={true}
            onChange={setName}
          />
          <TextInput
            label="description"
            placeholder="Descripción"
            required={true}
            onChange={setDescription}
          />
          <NumberInput
            label="price"
            placeholder="Precio"
            required={true}
            onChange={setprice}
            min={0}
            max={999999999}
            maxLength={9}
          />
          <TextInput
            label="modelCode"
            placeholder="Código de Modelo"
            required={true}
            onChange={setModelCode}
          />
        </div>
        <div className="search-param-column">
          <TextInput
            label="color"
            placeholder="Color"
            required={true}
            onChange={setColor}
          />
          <TextInput
            label="category"
            placeholder="Categoría"
            required={true}
            onChange={setCategory}
          />
          <NumberInput
            label="warranty"
            placeholder="Garantía"
            required={true}
            onChange={setWarranty}
            min={0}
            max={99999}
            maxLength={5}
          />
          <label htmlFor="factory" className="text-input-label">
            Fábrica
          </label>
          <select
            id="factory"
            className="form-control text-input"
            onChange={(e) => {
              setFactoryId(
                availableFactories[e.target.selectedIndex].id_factory
              );
            }}
            style={{
              backgroundColor: helpers.PALETTE.lightGray,
            }}
          >
            {!props.loading ? (
              availableFactories.map((factory) => (
                <option key={factory.id_factory} value={factory.name}>
                  {factory.name}
                </option>
              ))
            ) : (
              <></>
            )}
          </select>
        </div>
      </div>
      <button
        className="btn btn-lg btn-primary btn-block login-btn"
        type="submit"
        onClick={(e) => {
          e.preventDefault();
          handleDevicesSearchSubmission();
        }}
        style={{
          backgroundColor: helpers.PALETTE.darkGreen,
          borderColor: helpers.PALETTE.darkGreen,
        }}
      >
        Buscar Dispositivos
      </button>
    </form>
  );
}

export default SpecializedSearchForm;


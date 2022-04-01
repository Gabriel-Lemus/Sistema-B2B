import axios from 'axios';
import React, { useEffect, useState } from 'react';
import helpers from '../../helpers/helpers';
import { useNavigate } from 'react-router-dom';
import TextInput from './TextInput';
import NumberInput from './NumberInput';

function SpecializedSearchForm(props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState(0);
  const [availableBrands, setavailableBrands] = useState([]);
  const [existances, setExistances] = useState(-1);
  const [price, setprice] = useState(-1);
  const [modelCode, setModelCode] = useState('');
  const [color, setColor] = useState('');
  const [category, setCategory] = useState('');
  const [warranty, setWarranty] = useState(-1);
  const navigate = useNavigate();

  useEffect(async () => {
    // Set the available brands
    const listedBrands = await axios.get(
      `http://${helpers.LOCALHOST_IP}:${helpers.TOMCAT_PORT}/sales-system/sales?table=marcas`
    );
    setavailableBrands([
      { id_marca: 0, nombre: 'Todas las marcas' },
      ...listedBrands.data.data,
    ]);
    props.setLoading(false);
  }, []);

  const handleDevicesSearchSubmission = async () => {
    if (
      name === '' &&
      description === '' &&
      brand === 0 &&
      existances === -1 &&
      price === -1 &&
      modelCode === '' &&
      color === '' &&
      category === '' &&
      warranty === -1
    ) {
      navigate('/catalogo-dispositivos');
    } else {
      let deviceSearch = {
        nombre: name,
        descripcion: description,
        id_marca: brand === 0 ? '' : brand.toString(),
        existencias: existances === -1 ? '' : existances,
        precio: price === -1 ? '' : price,
        codigo_modelo: modelCode,
        color: color,
        categoria: category,
        tiempo_garantia: warranty === -1 ? '' : warranty,
      };

      navigate('/catalogo-dispositivos-busqueda', {
        state: {
          deviceSearch: deviceSearch,
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
            label="existances"
            placeholder="Existencias"
            required={true}
            onChange={setExistances}
            min={0}
            max={99999}
            maxLength={5}
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
        </div>
        <div className="search-param-column">
          <TextInput
            label="modelCode"
            placeholder="Código de Modelo"
            required={true}
            onChange={setModelCode}
          />
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
        </div>
      </div>
      <label htmlFor="brand" className="text-input-label">
        Marca
      </label>
      <select
        id="brand"
        className="form-control text-input"
        onChange={(e) => {
          setBrand(
            availableBrands.findIndex(
              (brand) => brand.nombre === e.target.value
            )
          );
        }}
        style={{
          backgroundColor: helpers.PALETTE.lightGray,
        }}
      >
        {!props.loading ? (
          availableBrands.map((brand) => (
            <option key={brand.id_marca} value={brand.nombre}>
              {brand.nombre}
            </option>
          ))
        ) : (
          <></>
        )}
      </select>
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

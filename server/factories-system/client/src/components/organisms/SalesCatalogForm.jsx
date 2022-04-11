import axios from 'axios';
import React, { useState, useEffect } from 'react';
import helpers from '../../helpers/helpers';
import secrets from '../../helpers/secrets';

function SalesCatalogForm(props) {
  const [devices, setDevices] = useState([]);
  const [newDevices, setNewDevices] = useState([]);
  const [catalogChanged, setCatalogChanged] = useState(false);
  const [newDevicesToAdd, setNewDevicesToAdd] = useState([]);
  const [canAddNewDevices, setCanAddNewDevices] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [brands, setBrands] = useState([]);
  const [seller, setSeller] = useState({});

  useEffect(async () => {
    const sellerDevices = await axios.get(
      `http://${secrets.LOCALHOST_IP}:${
        secrets.TOMCAT_PORT
      }/sales-system/sellers?get=true&verVendedor=${localStorage
        .getItem('userName')
        .replace(/\s/g, '_')}&table=${localStorage
        .getItem('userName')
        .replace(/\s/g, '_')}_dispositivos`
    );
    const brands = await axios.get(
      `http://${secrets.LOCALHOST_IP}:${secrets.TOMCAT_PORT}/sales-system/sales?table=marcas`
    );
    setIsAdmin(localStorage.getItem('isAdmin') === 'true');
    setBrands(brands.data.data);
    setDevices(sellerDevices.data.data);
    setNewDevices(sellerDevices.data.data);
    setSeller({
      id: localStorage.getItem('userId'),
      sellerName: localStorage.getItem('userName'),
    });
    props.setLoading(false);
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
    props.setLoading(true);
    let couldUpdateAllDevices = true;

    for (let i = 0; i < newDevices.length; i++) {
      let deviceUpdate = await axios.put(
        `http://${secrets.LOCALHOST_IP}:${
          secrets.TOMCAT_PORT
        }/sales-system/sellers?verVendedor=${seller.sellerName.replace(
          /\s/g,
          '_'
        )}&table=${seller.sellerName.replace(/\s/g, '_')}_dispositivos&id=${
          newDevices[i].id_dispositivo
        }`,
        newDevices[i]
      );

      if (!deviceUpdate.data.success) {
        couldUpdateAllDevices = false;
        break;
      }
    }

    if (couldUpdateAllDevices) {
      setCatalogChanged(false);
      setDevices(newDevices);
      setNewDevices(newDevices);
      props.setLoading(false);
      helpers.showModal(
        'Operación exitosa',
        'Se han actualizado los dispositivos.'
      );
    } else {
      props.setLoading(false);
      helpers.showModal(
        'Error',
        'No se pudieron actualizar los dispositivos. Por favor, inténtelo de nuevo.'
      );
    }
  };

  const handleAddNewDeviceRow = () => {
    setNewDevicesToAdd([
      ...newDevicesToAdd,
      {
        categoria: '',
        codigo_modelo: '',
        color: '',
        descripcion: '',
        existencias: 0,
        id_dispositivo: devices.length + newDevicesToAdd.length + 1,
        id_marca: 1,
        id_vendedor: localStorage.getItem('userId'),
        nombre: '',
        precio: 0,
        tiempo_garantia: 0,
        imagenes: [],
      },
    ]);
  };

  const handlePostNewDevices = async () => {
    props.setLoading(true);
    let devicesToAdd = [];
    let enoughImages;
    let enoughData;
    let correctImagesExtension = true;

    for (let i = 0; i < newDevicesToAdd.length; i++) {
      if (
        newDevicesToAdd[i].nombre !== '' &&
        newDevicesToAdd[i].descripcion !== '' &&
        newDevicesToAdd[i].existencias !== 0 &&
        newDevicesToAdd[i].precio !== 0 &&
        newDevicesToAdd[i].codigo_modelo !== '' &&
        newDevicesToAdd[i].color !== '' &&
        newDevicesToAdd[i].categoria !== '' &&
        newDevicesToAdd[i].tiempo_garantia !== 0
      ) {
        devicesToAdd.push(newDevicesToAdd[i]);
        enoughData = true;
      } else {
        enoughData = false;
        break;
      }

      if (newDevicesToAdd[i].imagenes.length >= 3) {
        enoughImages = true;
      } else {
        enoughImages = false;
        break;
      }

      // Check if images have correct extension: jpg, jpeg or png
      for (let j = 0; j < newDevicesToAdd[i].imagenes.length; j++) {
        if (
          !newDevicesToAdd[i].imagenes[j].name.endsWith('.jpg') &&
          !newDevicesToAdd[i].imagenes[j].name.endsWith('.jpeg') &&
          !newDevicesToAdd[i].imagenes[j].name.endsWith('.png')
        ) {
          correctImagesExtension = false;
          break;
        }
      }
    }

    if (!correctImagesExtension) {
      props.setLoading(false);
      helpers.showModal(
        'Formato incorrecto',
        'Las extensiones de las imágenes deben ser jpg, jpeg o png.'
      );
    } else if (!enoughData) {
      props.setLoading(false);
      helpers.showModal(
        'No se pudieron agregar los dispositivos',
        'No hay suficientes datos para agregar los dispositivos Por favor, ingrese todos los datos solicitados.'
      );
    } else if (!enoughImages) {
      props.setLoading(false);
      helpers.showModal(
        'Faltan imágenes',
        'Por favor, agregue un mínimo de 3 imágenes de sus dispositivos.'
      );
    } else {
      for (let i = 0; i < devicesToAdd.length; i++) {
        // Add the new device and then add the images
        let postDevice = await axios.post(
          `http://${secrets.LOCALHOST_IP}:${
            secrets.TOMCAT_PORT
          }/sales-system/sellers?verVendedor=${seller.sellerName.replace(
            ' ',
            '_'
          )}&table=${seller.sellerName.replace(' ', '_')}_dispositivos`,
          devicesToAdd[i]
        );

        if (!postDevice.data.success) {
          props.setLoading(false);
          helpers.showModal(
            'Error',
            'No se pudieron agregar los dispositivos. Por favor, inténtelo de nuevo.'
          );
          break;
        } else {
          const deviceId = postDevice.data.dataAdded.id_dispositivo;

          // Upload the images
          for (let j = 0; j < devicesToAdd[i].imagenes.length; j++) {
            let formData = new FormData();
            formData.append(
              'fileName',
              `${helpers.replaceWhiteSpaces(
                localStorage.getItem('userName'),
                '-'
              )}-${Date.now()}-product-image.jpg`
            );
            formData.append('product-image', devicesToAdd[i].imagenes[j]);
            let sellerProductImgUpload = await axios.post(
              `http://${secrets.LOCALHOST_IP}:3001/upload-product-image`,
              formData,
              {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              }
            );
            let imageUrl = sellerProductImgUpload.data.imgURL.slice(
              sellerProductImgUpload.data.imgURL.indexOf(':') + 1
            );
            imageUrl = imageUrl.slice(imageUrl.indexOf(':'));

            // Upload the image url
            let postImage = await axios.post(
              `http://${secrets.LOCALHOST_IP}:${
                secrets.TOMCAT_PORT
              }/sales-system/sellers?verVendedor=${seller.sellerName.replace(
                ' ',
                '_'
              )}&table=${seller.sellerName.replace(
                ' ',
                '_'
              )}_fotos_dispositivos`,
              {
                id_dispositivo: deviceId,
                foto: imageUrl,
              }
            );
          }
        }
      }

      setNewDevicesToAdd([]);
      setDevices([...devices, ...devicesToAdd]);
      props.setLoading(false);
      helpers.showModal(
        'Operación exitosa',
        'Se han agregado los dispositivos.'
      );
    }
  };

  return !props.loading ? (
    <>
      {isAdmin ? (
        <section className="sales-catalog mt-4">
          <h4>
            {seller.sellerName.charAt(0).toUpperCase() +
              seller.sellerName.slice(1)}
          </h4>
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
                  <th scope="col">Marca</th>
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
                          potentialNewDevices[
                            device.id_dispositivo - 1
                          ].nombre = e.target.value;
                          setNewDevices(potentialNewDevices);
                          if (
                            !equivalentDevices(devices, potentialNewDevices)
                          ) {
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
                          if (
                            !equivalentDevices(devices, potentialNewDevices)
                          ) {
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
                          if (
                            !equivalentDevices(devices, potentialNewDevices)
                          ) {
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
                          potentialNewDevices[
                            device.id_dispositivo - 1
                          ].precio = Number(e.target.value);
                          setNewDevices(potentialNewDevices);
                          if (
                            !equivalentDevices(devices, potentialNewDevices)
                          ) {
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
                          if (
                            !equivalentDevices(devices, potentialNewDevices)
                          ) {
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
                          if (
                            !equivalentDevices(devices, potentialNewDevices)
                          ) {
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
                          potentialNewDevices[
                            device.id_dispositivo - 1
                          ].categoria = e.target.value;
                          setNewDevices(potentialNewDevices);
                          if (
                            !equivalentDevices(devices, potentialNewDevices)
                          ) {
                            setCatalogChanged(true);
                          } else {
                            setCatalogChanged(false);
                          }
                        }}
                      />
                    </td>
                    <td>
                      <select
                        className="form-control"
                        defaultValue={device.id_marca}
                        onChange={(e) => {
                          let potentialNewDevices = JSON.parse(
                            JSON.stringify(newDevices)
                          );
                          potentialNewDevices[
                            device.id_dispositivo - 1
                          ].id_marca = Number(e.target.value);
                          setNewDevices(potentialNewDevices);
                          if (
                            !equivalentDevices(devices, potentialNewDevices)
                          ) {
                            setCatalogChanged(true);
                          } else {
                            setCatalogChanged(false);
                          }
                        }}
                      >
                        {brands.map((brand) => (
                          <option key={brand.id_marca} value={brand.id_marca}>
                            {brand.nombre}
                          </option>
                        ))}
                      </select>
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
                          if (
                            !equivalentDevices(devices, potentialNewDevices)
                          ) {
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
          <section className="new-devices">
            <h2 className="mt-5">Agregar Nuevo Dispositivo</h2>
            <button className="btn btn-primary" onClick={handleAddNewDeviceRow}>
              Nuevo Dispositivo
            </button>
            <table id="newDevicesTable" className="table table-striped">
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
                  <th scope="col">Marca</th>
                  <th scope="col">Años de Garantía</th>
                  <th scope="col">Imágenes</th>
                </tr>
              </thead>
              <tbody>
                {newDevicesToAdd.map((device) => (
                  <tr key={device.id_dispositivo}>
                    <th scope="row">{device.id_dispositivo}</th>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue={device.nombre}
                        onChange={(e) => {
                          let potentialNewDevices = JSON.parse(
                            JSON.stringify(newDevicesToAdd)
                          );
                          potentialNewDevices[
                            newDevicesToAdd.indexOf(device)
                          ].nombre = e.target.value;
                          setNewDevicesToAdd(potentialNewDevices);
                          if (e.target.value !== '') {
                            setCanAddNewDevices(true);
                          } else {
                            setCanAddNewDevices(false);
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
                            JSON.stringify(newDevicesToAdd)
                          );
                          potentialNewDevices[
                            newDevicesToAdd.indexOf(device)
                          ].descripcion = e.target.value;
                          setNewDevicesToAdd(potentialNewDevices);
                          if (e.target.value !== '') {
                            setCanAddNewDevices(true);
                          } else {
                            setCanAddNewDevices(false);
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
                            JSON.stringify(newDevicesToAdd)
                          );
                          potentialNewDevices[
                            newDevicesToAdd.indexOf(device)
                          ].existencias = Number(e.target.value);
                          setNewDevicesToAdd(potentialNewDevices);
                          if (e.target.value !== '') {
                            setCanAddNewDevices(true);
                          } else {
                            setCanAddNewDevices(false);
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
                            JSON.stringify(newDevicesToAdd)
                          );
                          potentialNewDevices[
                            newDevicesToAdd.indexOf(device)
                          ].precio = Number(e.target.value);
                          setNewDevicesToAdd(potentialNewDevices);
                          if (e.target.value !== '') {
                            setCanAddNewDevices(true);
                          } else {
                            setCanAddNewDevices(false);
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
                            JSON.stringify(newDevicesToAdd)
                          );
                          potentialNewDevices[
                            newDevicesToAdd.indexOf(device)
                          ].codigo_modelo = e.target.value;
                          setNewDevicesToAdd(potentialNewDevices);
                          if (e.target.value !== '') {
                            setCanAddNewDevices(true);
                          } else {
                            setCanAddNewDevices(false);
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
                            JSON.stringify(newDevicesToAdd)
                          );
                          potentialNewDevices[
                            newDevicesToAdd.indexOf(device)
                          ].color = e.target.value;
                          setNewDevicesToAdd(potentialNewDevices);
                          if (e.target.value !== '') {
                            setCanAddNewDevices(true);
                          } else {
                            setCanAddNewDevices(false);
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
                            JSON.stringify(newDevicesToAdd)
                          );
                          potentialNewDevices[
                            newDevicesToAdd.indexOf(device)
                          ].categoria = e.target.value;
                          setNewDevicesToAdd(potentialNewDevices);
                          if (e.target.value !== '') {
                            setCanAddNewDevices(true);
                          } else {
                            setCanAddNewDevices(false);
                          }
                        }}
                      />
                    </td>
                    <td>
                      <select
                        className="form-control"
                        defaultValue={device.id_marca}
                        onChange={(e) => {
                          let potentialNewDevices = JSON.parse(
                            JSON.stringify(newDevicesToAdd)
                          );
                          potentialNewDevices[
                            newDevicesToAdd.indexOf(device)
                          ].id_marca = Number(e.target.value);
                          setNewDevices(potentialNewDevices);
                        }}
                      >
                        {brands.map((brand) => (
                          <option key={brand.id_marca} value={brand.id_marca}>
                            {brand.nombre}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        className="form-control"
                        defaultValue={device.tiempo_garantia}
                        onChange={(e) => {
                          let potentialNewDevices = JSON.parse(
                            JSON.stringify(newDevicesToAdd)
                          );
                          potentialNewDevices[
                            newDevicesToAdd.indexOf(device)
                          ].tiempo_garantia = Number(e.target.value);
                          setNewDevicesToAdd(potentialNewDevices);
                          if (e.target.value !== '') {
                            setCanAddNewDevices(true);
                          } else {
                            setCanAddNewDevices(false);
                          }
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="file"
                        multiple
                        className="form-control"
                        onChange={(e) => {
                          let potentialNewDevices = JSON.parse(
                            JSON.stringify(newDevicesToAdd)
                          );
                          potentialNewDevices[
                            newDevicesToAdd.indexOf(device)
                          ].imagenes = e.target.files;
                          setNewDevicesToAdd(potentialNewDevices);
                          if (e.target.files.length > 3) {
                            setCanAddNewDevices(true);
                          } else {
                            setCanAddNewDevices(false);
                          }
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {newDevicesToAdd.length === 0 && !canAddNewDevices ? (
              <button className="btn btn-primary" disabled>
                Guardar Nuevos Dispositivos
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handlePostNewDevices}
              >
                Guardar Nuevos Dispositivos
              </button>
            )}
          </section>
        </section>
      ) : (
        <section className="sales-catalog mt-4">
          <h4>
            {seller.sellerName.charAt(0).toUpperCase() +
              seller.sellerName.slice(1)}
          </h4>
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
                  <th scope="col">Marca</th>
                  <th scope="col">Años de Garantía</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => (
                  <tr key={device.id_dispositivo}>
                    <th scope="row">{device.id_dispositivo}</th>
                    <td>{device.nombre}</td>
                    <td>{device.descripcion}</td>
                    <td>{device.existencias}</td>
                    <td>{device.precio}</td>
                    <td>{device.codigo_modelo}</td>
                    <td>{device.color}</td>
                    <td>{device.categoria}</td>
                    <td>
                      {
                        brands.filter(
                          (brand) => brand.id_marca === device.id_marca
                        )[0].nombre
                      }
                    </td>
                    <td>{device.tiempo_garantia}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="new-devices">
            <h2 className="mt-5">Agregar Nuevo Dispositivo</h2>
            <button className="btn btn-primary" onClick={handleAddNewDeviceRow}>
              Nuevo Dispositivo
            </button>
            <table id="newDevicesTable" className="table table-striped">
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
                  <th scope="col">Marca</th>
                  <th scope="col">Años de Garantía</th>
                  <th scope="col">Imágenes</th>
                </tr>
              </thead>
              <tbody>
                {newDevicesToAdd.map((device) => (
                  <tr key={device.id_dispositivo}>
                    <th scope="row">{device.id_dispositivo}</th>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue={device.nombre}
                        onChange={(e) => {
                          let potentialNewDevices = JSON.parse(
                            JSON.stringify(newDevicesToAdd)
                          );
                          potentialNewDevices[
                            newDevicesToAdd.indexOf(device)
                          ].nombre = e.target.value;
                          setNewDevicesToAdd(potentialNewDevices);
                          if (e.target.value !== '') {
                            setCanAddNewDevices(true);
                          } else {
                            setCanAddNewDevices(false);
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
                            JSON.stringify(newDevicesToAdd)
                          );
                          potentialNewDevices[
                            newDevicesToAdd.indexOf(device)
                          ].descripcion = e.target.value;
                          setNewDevicesToAdd(potentialNewDevices);
                          if (e.target.value !== '') {
                            setCanAddNewDevices(true);
                          } else {
                            setCanAddNewDevices(false);
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
                            JSON.stringify(newDevicesToAdd)
                          );
                          potentialNewDevices[
                            newDevicesToAdd.indexOf(device)
                          ].existencias = Number(e.target.value);
                          setNewDevicesToAdd(potentialNewDevices);
                          if (e.target.value !== '') {
                            setCanAddNewDevices(true);
                          } else {
                            setCanAddNewDevices(false);
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
                            JSON.stringify(newDevicesToAdd)
                          );
                          potentialNewDevices[
                            newDevicesToAdd.indexOf(device)
                          ].precio = Number(e.target.value);
                          setNewDevicesToAdd(potentialNewDevices);
                          if (e.target.value !== '') {
                            setCanAddNewDevices(true);
                          } else {
                            setCanAddNewDevices(false);
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
                            JSON.stringify(newDevicesToAdd)
                          );
                          potentialNewDevices[
                            newDevicesToAdd.indexOf(device)
                          ].codigo_modelo = e.target.value;
                          setNewDevicesToAdd(potentialNewDevices);
                          if (e.target.value !== '') {
                            setCanAddNewDevices(true);
                          } else {
                            setCanAddNewDevices(false);
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
                            JSON.stringify(newDevicesToAdd)
                          );
                          potentialNewDevices[
                            newDevicesToAdd.indexOf(device)
                          ].color = e.target.value;
                          setNewDevicesToAdd(potentialNewDevices);
                          if (e.target.value !== '') {
                            setCanAddNewDevices(true);
                          } else {
                            setCanAddNewDevices(false);
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
                            JSON.stringify(newDevicesToAdd)
                          );
                          potentialNewDevices[
                            newDevicesToAdd.indexOf(device)
                          ].categoria = e.target.value;
                          setNewDevicesToAdd(potentialNewDevices);
                          if (e.target.value !== '') {
                            setCanAddNewDevices(true);
                          } else {
                            setCanAddNewDevices(false);
                          }
                        }}
                      />
                    </td>
                    <td>
                      <select
                        className="form-control"
                        defaultValue={device.id_marca}
                        onChange={(e) => {
                          let potentialNewDevices = JSON.parse(
                            JSON.stringify(newDevicesToAdd)
                          );
                          potentialNewDevices[
                            newDevicesToAdd.indexOf(device)
                          ].id_marca = Number(e.target.value);
                          setNewDevices(potentialNewDevices);
                        }}
                      >
                        {brands.map((brand) => (
                          <option key={brand.id_marca} value={brand.id_marca}>
                            {brand.nombre}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        className="form-control"
                        defaultValue={device.tiempo_garantia}
                        onChange={(e) => {
                          let potentialNewDevices = JSON.parse(
                            JSON.stringify(newDevicesToAdd)
                          );
                          potentialNewDevices[
                            newDevicesToAdd.indexOf(device)
                          ].tiempo_garantia = Number(e.target.value);
                          setNewDevicesToAdd(potentialNewDevices);
                          if (e.target.value !== '') {
                            setCanAddNewDevices(true);
                          } else {
                            setCanAddNewDevices(false);
                          }
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="file"
                        multiple
                        className="form-control"
                        onChange={(e) => {
                          let potentialNewDevices = JSON.parse(
                            JSON.stringify(newDevicesToAdd)
                          );
                          potentialNewDevices[
                            newDevicesToAdd.indexOf(device)
                          ].imagenes = e.target.files;
                          setNewDevicesToAdd(potentialNewDevices);
                          if (e.target.files.length > 3) {
                            setCanAddNewDevices(true);
                          } else {
                            setCanAddNewDevices(false);
                          }
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {newDevicesToAdd.length === 0 && !canAddNewDevices ? (
              <button className="btn btn-primary" disabled>
                Guardar Nuevos Dispositivos
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handlePostNewDevices}
              >
                Guardar Nuevos Dispositivos
              </button>
            )}
          </section>
        </section>
      )}
    </>
  ) : (
    <></>
  );
}

export default SalesCatalogForm;

import axios from 'axios';
import React, { useState, useEffect } from 'react';
import helpers from '../../helpers/helpers';
import secrets from '../../helpers/secrets';

function SalesCatalogForm(props) {
  const [devices, setDevices] = useState([]);
  const [newDevices, setNewDevices] = useState([]);
  const [devicesImages, setDevicesImages] = useState([]);
  const [catalogChanged, setCatalogChanged] = useState(false);
  const [newDevicesToAdd, setNewDevicesToAdd] = useState([]);
  const [canAddNewDevices, setCanAddNewDevices] = useState(false);

  useEffect(async () => {
    const factoryName = localStorage.getItem('name');
    const factoryDevices = await axios.get(
      `http://${secrets.LOCALHOST_IP}:${secrets.FACTORIES_BACKEND_PORT}/devices?factoryDevices=${factoryName}`
    );
    setDevices(factoryDevices.data.data);
    setNewDevices(factoryDevices.data.data);
    props.setLoading(false);
  }, []);

  const copyFileList = (fileList) => {
    const newFileList = [];
    for (let i = 0; i < fileList.length; i++) {
      const newFileListArray = [];
      for (let j = 0; j < fileList[i].length; j++) {
        newFileListArray.push(fileList[i][j]);
      }
      newFileList.push(newFileListArray);
    }
    return newFileList;
  };

  const compareArraysOfObjects = (array1, array2) => {
    if (array1.length !== array2.length) {
      return false;
    }

    for (let i = 0; i < array1.length; i++) {
      if (!helpers.compareObjects(array1[i], array2[i])) {
        return false;
      }
    }

    return true;
  };

  const canAddNewDevice = (e, device) => {
    return (
      e.target.value.length > 0 &&
      device.description.length > 0 &&
      device.price > 0 &&
      device.model_code.length > 0 &&
      device.color.length > 0 &&
      device.category.length > 0 &&
      device.warranty_time > 0 &&
      device.shipping_time > 0 &&
      device.images.length > 0
    );
  };

  const checkDeviceData = (device, idx) => {
    if (devicesImages[idx] !== undefined && devicesImages.length !== 0) {
      return (
        device.name !== '' &&
        device.description !== '' &&
        device.price > 0 &&
        device.model_code !== '' &&
        device.color !== '' &&
        device.category !== '' &&
        device.warranty_time > 0 &&
        device.shipping_time > 0 &&
        devicesImages[idx].length > 2
      );
    } else {
      return false;
    }
  };

  const handleDeviceDelete = async (deviceId) => {
    props.setLoading(true);

    // Attempt to delete the device
    try {
      const deleteDeviceRes = await axios.delete(
        `http://${secrets.LOCALHOST_IP}:${secrets.FACTORIES_BACKEND_PORT}/?deviceId=${deviceId}`
      );

      if (deleteDeviceRes.data.success) {
        const newDevices = devices.filter((device) => device._id !== deviceId);
        setDevices(newDevices);
        setNewDevices(newDevices);
        setCatalogChanged(false);
        props.setLoading(false);
      }
    } catch (error) {
      props.setLoading(false);
      helpers.showModal(
        'Ocurrió un error',
        'Hubo un error al tratar de eliminar el dispositivo. Por favor, intente nuevamente.'
      );
    }
  };

  const handleUpdateDevices = async () => {
    props.setLoading(true);

    // Iterate through the new devices and update the ones that have changed
    for (let i = 0; i < newDevices.length; i++) {
      if (
        !helpers.compareObjects(
          { ...devices[i], images: null },
          { ...newDevices[i], images: null }
        )
      ) {
        try {
          const updateDeviceRes = await axios.put(
            `http://${secrets.LOCALHOST_IP}:${secrets.FACTORIES_BACKEND_PORT}/?deviceId=${newDevices[i]._id}&schema=devices`,
            newDevices[i]
          );

          if (!updateDeviceRes.data.success) {
            props.setLoading(false);
            helpers.showModal(
              'Ocurrió un error',
              'Hubo un error al tratar de actualizar los datos de los dispositivos. Por favor, intente nuevamente.'
            );
          }
        } catch (error) {
          props.setLoading(false);
          helpers.showModal(
            'Ocurrió un error',
            'Hubo un error al tratar de actualizar los dispositivos. Por favor, intente nuevamente.'
          );
        }
      }
    }

    // All the devices were updated successfully
    setDevices(newDevices);
    setNewDevices(newDevices);
    setCatalogChanged(false);
    props.setLoading(false);
    helpers.showModal(
      'Operación exitosa',
      'Los datos de los dispositivos fueron actualizados correctamente.'
    );
  };

  const handleAddNewDeviceRow = () => {
    setNewDevicesToAdd([
      ...newDevicesToAdd,
      {
        factoryId: localStorage.getItem('id'),
        name: '',
        description: '',
        price: 0,
        model_code: '',
        color: '',
        category: '',
        warranty_time: 0,
        shipping_time: 0,
        images: [],
      },
    ]);
  };

  const handlePostNewDevices = async () => {
    props.setLoading(true);
    let canAddDevices = true;
    let addedDevices = [];
    let addedDeviceResponse;

    // Iterate through the newDevicesToAdd array and check if all the fields are filled
    for (let i = 0; i < newDevicesToAdd.length; i++) {
      if (!checkDeviceData(newDevicesToAdd[i], i)) {
        canAddDevices = false;
        break;
      }
    }

    // If all the fields are filled, then add the new devices
    if (canAddDevices) {
      // Iterate through the devices
      for (let i = 0; i < newDevicesToAdd.length; i++) {
        let correctImagesExtension = true;

        // Check if the images have the correct format: jpg, jpeg or png
        for (let j = 0; j < devicesImages[i].length; j++) {
          if (
            !devicesImages[i][j].name.endsWith('.jpg') &&
            !devicesImages[i][j].name.endsWith('.jpeg') &&
            !devicesImages[i][j].name.endsWith('.png')
          ) {
            correctImagesExtension = false;
            break;
          }
        }

        // If the images have the correct format, then upload them
        if (correctImagesExtension) {
          let imagesUrls = [];

          for (let j = 0; j < devicesImages[i].length; j++) {
            let formData = new FormData();
            formData.append(
              'fileName',
              `${helpers.replaceWhiteSpaces(
                localStorage.getItem('name'),
                '-'
              )}-${Date.now()}-product-image.jpg`
            );
            formData.append('product-image', devicesImages[i][j]);
            let factoryDeviceImgRes = await axios.post(
              `http://${secrets.LOCALHOST_IP}:${secrets.FILE_SERVER_PORT}/upload-product-image`,
              formData,
              {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              }
            );
            let imageUrl = factoryDeviceImgRes.data.imgURL.slice(
              factoryDeviceImgRes.data.imgURL.indexOf(':') + 1
            );
            imageUrl = imageUrl.slice(imageUrl.indexOf(':'));
            imagesUrls.push(imageUrl);
          }

          // Add the new device to the database
          try {
            const addDeviceRes = await axios.post(
              `http://${secrets.LOCALHOST_IP}:${secrets.FACTORIES_BACKEND_PORT}/devices`,
              {
                ...newDevicesToAdd[i],
                images: imagesUrls,
              }
            );
            addedDeviceResponse = addDeviceRes;

            if (!addDeviceRes.data.success) {
              props.setLoading(false);
              helpers.showModal(
                'Ocurrió un error',
                'Hubo un error al tratar de agregar los dispositivos. Por favor, intente nuevamente.'
              );
            }
          } catch (error) {
            props.setLoading(false);
            helpers.showModal(
              'Ocurrió un error',
              'Hubo un error al tratar de agregar los dispositivos. Por favor, intente nuevamente.'
            );
          }

          addedDevices.push({
            ...addedDeviceResponse.data.dataAdded,
            images: imagesUrls,
          });

          // All the images were uploaded successfully
          setNewDevicesToAdd([]);
          setCatalogChanged(false);
          setDevices([...devices, ...addedDevices]);
          setNewDevices([...devices, ...addedDevices]);
          setDevicesImages([]);
          props.setLoading(false);
          helpers.showModal(
            'Operación exitosa',
            'Los dispositivos fueron agregados correctamente.'
          );
        } else {
          props.setLoading(false);
          helpers.showModal(
            'Archivos inválidos',
            'Por favor, asegúrese de que todas las imágenes tengan el formato .jpg, .jpeg o .png.'
          );
        }
      }
    } else {
      props.setLoading(false);
      helpers.showModal(
        'Datos incompletos',
        'Por favor, complete todos los campos para poder agregar los dispositivos.'
      );
    }
  };

  return !props.loading ? (
    <section className="sales-catalog">
      <section className="new-factory-devices">
        <h3 className="mt-5">Agregar nuevo dispositivo</h3>
        <button
          className="btn btn-primary"
          onClick={handleAddNewDeviceRow}
          style={{
            marginTop: '1rem',
            width: '100%',
            marginLeft: '10px',
            marginRight: '10px',
          }}
        >
          Agregar dispositivo
        </button>
        <table id="newDevicesTable" className="table table-striped mt-3">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Dispositivo</th>
              <th scope="col">Descripción</th>
              <th scope="col">Precio (Q.)</th>
              <th scope="col">Código de Modelo</th>
              <th scope="col">Color</th>
              <th scope="col">Categoría</th>
              <th scope="col">Marca</th>
              <th scope="col">Años de Garantía</th>
              <th scope="col">Tiempo de Envío (días)</th>
              <th scope="col">Imágenes</th>
            </tr>
          </thead>
          <tbody>
            {newDevicesToAdd.map((device, index) => (
              <tr key={index}>
                <th scope="row">{index + 1}</th>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={device.name}
                    onChange={(e) => {
                      let potentialNewDevices = JSON.parse(
                        JSON.stringify(newDevicesToAdd)
                      );
                      potentialNewDevices[index].name = e.target.value;
                      setNewDevicesToAdd(potentialNewDevices);
                      setCanAddNewDevices(
                        canAddNewDevice(e, potentialNewDevices[index])
                      );
                    }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={device.description}
                    onChange={(e) => {
                      let potentialNewDevices = JSON.parse(
                        JSON.stringify(newDevicesToAdd)
                      );
                      potentialNewDevices[index].description = e.target.value;
                      setNewDevicesToAdd(potentialNewDevices);
                      setCanAddNewDevices(
                        canAddNewDevice(e, potentialNewDevices[index])
                      );
                    }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={device.price}
                    onChange={(e) => {
                      let potentialNewDevices = JSON.parse(
                        JSON.stringify(newDevicesToAdd)
                      );
                      potentialNewDevices[index].price = Number(e.target.value);
                      setNewDevicesToAdd(potentialNewDevices);
                      setCanAddNewDevices(
                        canAddNewDevice(e, potentialNewDevices[index])
                      );
                    }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={device.model_code}
                    onChange={(e) => {
                      let potentialNewDevices = JSON.parse(
                        JSON.stringify(newDevicesToAdd)
                      );
                      potentialNewDevices[index].model_code = e.target.value;
                      setNewDevicesToAdd(potentialNewDevices);
                      setCanAddNewDevices(
                        canAddNewDevice(e, potentialNewDevices[index])
                      );
                    }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={device.color}
                    onChange={(e) => {
                      let potentialNewDevices = JSON.parse(
                        JSON.stringify(newDevicesToAdd)
                      );
                      potentialNewDevices[index].color = e.target.value;
                      setNewDevicesToAdd(potentialNewDevices);
                      setCanAddNewDevices(
                        canAddNewDevice(e, potentialNewDevices[index])
                      );
                    }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={device.category}
                    onChange={(e) => {
                      let potentialNewDevices = JSON.parse(
                        JSON.stringify(newDevicesToAdd)
                      );
                      potentialNewDevices[index].category = e.target.value;
                      setNewDevicesToAdd(potentialNewDevices);
                      setCanAddNewDevices(
                        canAddNewDevice(e, potentialNewDevices[index])
                      );
                    }}
                  />
                </td>
                <td>
                  <div>{localStorage.getItem('name')}</div>
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={device.warranty_time}
                    onChange={(e) => {
                      let potentialNewDevices = JSON.parse(
                        JSON.stringify(newDevicesToAdd)
                      );
                      potentialNewDevices[index].warranty_time = Number(
                        e.target.value
                      );
                      setNewDevicesToAdd(potentialNewDevices);
                      setCanAddNewDevices(
                        canAddNewDevice(e, potentialNewDevices[index])
                      );
                    }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={device.shipping_time}
                    onChange={(e) => {
                      let potentialNewDevices = JSON.parse(
                        JSON.stringify(newDevicesToAdd)
                      );
                      potentialNewDevices[index].shipping_time = Number(
                        e.target.value
                      );
                      setNewDevicesToAdd(potentialNewDevices);
                      setCanAddNewDevices(
                        canAddNewDevice(e, potentialNewDevices[index])
                      );
                    }}
                  />
                </td>
                <td>
                  <input
                    type="file"
                    className="form-control"
                    multiple
                    onChange={(e) => {
                      let potentialNewImages = copyFileList(devicesImages);

                      if (potentialNewImages[index] === undefined) {
                        potentialNewImages[index] = [];

                        for (let i = 0; i < e.target.files.length; i++) {
                          potentialNewImages[index].push(e.target.files[i]);
                        }
                      } else {
                        // Remove the old images and add the new ones
                        potentialNewImages[index] = [];

                        for (let i = 0; i < e.target.files.length; i++) {
                          potentialNewImages[index][i] = e.target.files[i];
                        }
                      }
                      setDevicesImages(potentialNewImages);
                      setCanAddNewDevices(
                        canAddNewDevice(e, newDevicesToAdd[index])
                      );
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {newDevicesToAdd.length === 0 && !canAddNewDevices ? (
          <button
            className="btn btn-primary disabled-btn"
            disabled
            style={{
              width: '100%',
              marginleft: '10px',
              marginRight: '-10px',
            }}
          >
            No ha agregado ningún dispositivo
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={handlePostNewDevices}
            style={{
              width: '100%',
              marginleft: '10px',
              marginRight: '-10px',
            }}
          >
            Agregar dispositivos
          </button>
        )}
      </section>
      <section className="factory-devices mt-4">
        <div className="small-separator"></div>
        <h3>Dispositivos</h3>
        <section className="factory-devices-list">
          {newDevices.length !== 0 ? (
            newDevices.map((device, index) => (
              <div className="device-card" key={index}>
                <input
                  type="text"
                  className="form-control text-input"
                  style={{ backgroundColor: helpers.PALETTE.lightGray }}
                  value={device.name}
                  onChange={(e) => {
                    let potentialNewDevices = JSON.parse(
                      JSON.stringify(newDevices)
                    );
                    potentialNewDevices[index].name = e.target.value;
                    setNewDevices(potentialNewDevices);
                    setCatalogChanged(
                      !compareArraysOfObjects(
                        devices.map((device) =>
                          Object.assign({}, device, { images: undefined })
                        ),
                        potentialNewDevices.map((device) =>
                          Object.assign({}, device, { images: undefined })
                        )
                      )
                    );
                  }}
                ></input>
                <div
                  id={`image-Carousel-${index}`}
                  className="carousel slide"
                  data-ride="carousel"
                >
                  <ol className="carousel-indicators">
                    {device.images.map((image, index2) => (
                      <li
                        data-target={`#image-Carousel-${index}`}
                        data-slide-to={index2}
                        className={index === 0 ? 'active' : ''}
                        key={index2}
                        style={{
                          border: 'none',
                          color: '#ff00ff',
                          backgroundColor: '#777',
                        }}
                      ></li>
                    ))}
                  </ol>
                  <div className="carousel-inner">
                    {device.images.map((image, index) => (
                      <div
                        className={`carousel-item ${
                          index === 0 ? 'active' : ''
                        }`}
                        key={index}
                      >
                        <img
                          className="d-block device-card-image"
                          src={`http://${secrets.LOCALHOST_IP}${image}`}
                          alt={`${device.name} image ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    className="carousel-control-prev"
                    type="button"
                    data-target={`#image-Carousel-${index}`}
                    data-slide="prev"
                    style={{
                      border: 'none',
                      color: '#ff00ff',
                      backgroundColor: '#000',
                    }}
                  >
                    <span
                      className="carousel-control-prev-icon"
                      aria-hidden="true"
                    ></span>
                    <span className="sr-only">Previous</span>
                  </button>
                  <button
                    className="carousel-control-next"
                    type="button"
                    data-target={`#image-Carousel-${index}`}
                    data-slide="next"
                    style={{
                      border: 'none',
                      color: '#ff00ff',
                      backgroundColor: '#000',
                    }}
                  >
                    <span
                      className="carousel-control-next-icon"
                      aria-hidden="true"
                    ></span>
                    <span className="sr-only">Next</span>
                  </button>
                </div>
                <b className="text-left mt-4">Descripción:</b>
                <input
                  type="text"
                  className="form-control text-input"
                  style={{ backgroundColor: helpers.PALETTE.lightGray }}
                  value={device.description}
                  onChange={(e) => {
                    let potentialNewDevices = JSON.parse(
                      JSON.stringify(newDevices)
                    );
                    potentialNewDevices[index].description = e.target.value;
                    setNewDevices(potentialNewDevices);
                    setCatalogChanged(
                      !compareArraysOfObjects(
                        devices.map((device) =>
                          Object.assign({}, device, { images: undefined })
                        ),
                        potentialNewDevices.map((device) =>
                          Object.assign({}, device, { images: undefined })
                        )
                      )
                    );
                  }}
                ></input>
                <b className="text-left">Precio:</b>
                <input
                  type="number"
                  className="form-control text-input"
                  style={{ backgroundColor: helpers.PALETTE.lightGray }}
                  step="0.01"
                  value={device.price}
                  onChange={(e) => {
                    let potentialNewDevices = JSON.parse(
                      JSON.stringify(newDevices)
                    );
                    potentialNewDevices[index].price = Number(e.target.value);
                    setNewDevices(potentialNewDevices);
                    setCatalogChanged(
                      !compareArraysOfObjects(
                        devices.map((device) =>
                          Object.assign({}, device, { images: undefined })
                        ),
                        potentialNewDevices.map((device) =>
                          Object.assign({}, device, { images: undefined })
                        )
                      )
                    );
                  }}
                ></input>
                <b className="text-left">Código de modelo:</b>
                <input
                  type="text"
                  className="form-control text-input"
                  style={{ backgroundColor: helpers.PALETTE.lightGray }}
                  value={device.model_code}
                  onChange={(e) => {
                    let potentialNewDevices = JSON.parse(
                      JSON.stringify(newDevices)
                    );
                    potentialNewDevices[index].model_code = e.target.value;
                    setNewDevices(potentialNewDevices);
                    setCatalogChanged(
                      !compareArraysOfObjects(
                        devices.map((device) =>
                          Object.assign({}, device, { images: undefined })
                        ),
                        potentialNewDevices.map((device) =>
                          Object.assign({}, device, { images: undefined })
                        )
                      )
                    );
                  }}
                ></input>
                <b className="text-left">Color:</b>
                <input
                  type="text"
                  className="form-control text-input"
                  style={{ backgroundColor: helpers.PALETTE.lightGray }}
                  value={device.color}
                  onChange={(e) => {
                    let potentialNewDevices = JSON.parse(
                      JSON.stringify(newDevices)
                    );
                    potentialNewDevices[index].color = e.target.value;
                    setNewDevices(potentialNewDevices);
                    setCatalogChanged(
                      !compareArraysOfObjects(
                        devices.map((device) =>
                          Object.assign({}, device, { images: undefined })
                        ),
                        potentialNewDevices.map((device) =>
                          Object.assign({}, device, { images: undefined })
                        )
                      )
                    );
                  }}
                ></input>
                <b className="text-left">Categoría:</b>
                <input
                  type="text"
                  className="form-control text-input"
                  style={{ backgroundColor: helpers.PALETTE.lightGray }}
                  value={device.category}
                  onChange={(e) => {
                    let potentialNewDevices = JSON.parse(
                      JSON.stringify(newDevices)
                    );
                    potentialNewDevices[index].category = e.target.value;
                    setNewDevices(potentialNewDevices);
                    setCatalogChanged(
                      !compareArraysOfObjects(
                        devices.map((device) =>
                          Object.assign({}, device, { images: undefined })
                        ),
                        potentialNewDevices.map((device) =>
                          Object.assign({}, device, { images: undefined })
                        )
                      )
                    );
                  }}
                ></input>
                <b className="text-left">Tiempo de garantía (años):</b>
                <input
                  type="number"
                  className="form-control text-input"
                  style={{ backgroundColor: helpers.PALETTE.lightGray }}
                  value={device.warranty_time}
                  min="1"
                  onChange={(e) => {
                    let potentialNewDevices = JSON.parse(
                      JSON.stringify(newDevices)
                    );
                    potentialNewDevices[index].warranty_time = Number(
                      e.target.value
                    );
                    setNewDevices(potentialNewDevices);
                    setCatalogChanged(
                      !compareArraysOfObjects(
                        devices.map((device) =>
                          Object.assign({}, device, { images: undefined })
                        ),
                        potentialNewDevices.map((device) =>
                          Object.assign({}, device, { images: undefined })
                        )
                      )
                    );
                  }}
                ></input>
                <b className="text-left">Tiempo de envío (días):</b>
                <input
                  type="number"
                  className="form-control text-input"
                  style={{ backgroundColor: helpers.PALETTE.lightGray }}
                  value={device.shipping_time}
                  min="1"
                  onChange={(e) => {
                    let potentialNewDevices = JSON.parse(
                      JSON.stringify(newDevices)
                    );
                    potentialNewDevices[index].shipping_time = Number(
                      e.target.value
                    );
                    setNewDevices(potentialNewDevices);
                    setCatalogChanged(
                      !compareArraysOfObjects(
                        devices.map((device) =>
                          Object.assign({}, device, { images: undefined })
                        ),
                        potentialNewDevices.map((device) =>
                          Object.assign({}, device, { images: undefined })
                        )
                      )
                    );
                  }}
                ></input>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    handleDeviceDelete(device._id);
                  }}
                >
                  Eliminar
                </button>
              </div>
            ))
          ) : (
            <div className="alert alert-info text-center" role="alert">
              <h5>Aún no ha registrado ningún dispositivo.</h5>
            </div>
          )}
        </section>
        {catalogChanged ? (
          <button
            className="btn btn-primary"
            onClick={handleUpdateDevices}
            style={{
              marginTop: '1rem',
              width: '100%',
              marginLeft: '10px',
              marginRight: '10px',
            }}
          >
            Guardar cambios
          </button>
        ) : (
          <button
            className="btn btn-primary disabled-btn"
            disabled
            style={{
              marginTop: '1rem',
              width: '100%',
              marginLeft: '10px',
              marginRight: '10px',
            }}
          >
            Dispositivos sin cambios
          </button>
        )}
      </section>
    </section>
  ) : (
    <></>
  );
}

export default SalesCatalogForm;


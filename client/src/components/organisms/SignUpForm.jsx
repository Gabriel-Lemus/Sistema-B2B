import React, { useState, useEffect } from 'react';
import axios from 'axios';
import $ from 'jquery';
import { Link } from 'react-router-dom';
import helpers from '../../helpers/helpers';
import { useNavigate } from 'react-router-dom';
import Loader from '../molecules/Loader';
import secrets from '../../helpers/secrets';

function SignUpForm() {
  // State
  const [userType, setUserType] = useState('');
  const [clientType, setClientType] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientNIT, setClientNIT] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientComPat, setClientComPat] = useState(new Blob());
  const [clientCardHolder, setClientCardHolder] = useState('');
  const [clientCardExpiration, setClientCardExpiration] = useState('');
  const [clientCardSecurityNumber, setClientCardSecurityNumber] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Use effect
  useEffect(() => {
    // Check if user is logged in
    if (
      helpers.isLoggedIn() &&
      localStorage.getItem('userType') !== 'vendedor'
    ) {
      navigate('/Catalogo-Dispositivos');
    } else if (helpers.isLoggedIn()) {
      navigate('/Catalogo-Ventas');
    }

    $('#usertype-dropdown-menu-options').children().eq(0).tooltip({
      placement: 'right',
      trigger: 'hover',
      title:
        'Permite realizar compras de los dispositivos electrónicos que ofrecen los vendedores.',
    });
    $('#usertype-dropdown-menu-options').children().eq(1).tooltip({
      placement: 'right',
      trigger: 'hover',
      title: 'Permite el registro de dispositivos electrónicos para su venta.',
    });
  }, []);

  useEffect(() => {
    if (userType === 'vendedor') {
      setClientType('');
    } else {
      $('#clienttype-dropdown-menu-options').children().eq(0).tooltip({
        placement: 'right',
        trigger: 'hover',
        title:
          'Permite la compra de productos sin necesidad de pagar una suscripción, pero no recibe descuentos.',
      });
      $('#clienttype-dropdown-menu-options').children().eq(1).tooltip({
        placement: 'right',
        trigger: 'hover',
        title:
          'Recibe un descuento del 5% en cada compra al pagar una suscripción anual.',
      });
      $('#clienttype-dropdown-menu-options').children().eq(2).tooltip({
        placement: 'right',
        trigger: 'hover',
        title:
          'Pagando una suscripción anual permite obtener un descuento del 15% en cada compra, realizar compras al crédito y pedidos a futuro.',
      });
    }
  }, [userType]);

  // Handlers
  /**
   * Handle the validation and submission of the credentials when the sign up button is clicked.
   */
  const handleCredentialsSubmission = async () => {
    setLoading(true);
    if (
      // Seller check
      (userType !== '' &&
        sellerName !== '' &&
        email !== '' &&
        password !== '' &&
        passwordConfirmation !== '') ||
      // Individual client check
      (userType !== '' &&
        clientType !== '' &&
        clientName !== '' &&
        email !== '' &&
        password !== '' &&
        passwordConfirmation !== '') ||
      // Large customer or distributor check
      (userType !== '' &&
        clientType !== '' &&
        clientName !== '' &&
        clientNIT !== '' &&
        email !== '' &&
        clientPhone !== '' &&
        clientComPat !== new Blob() &&
        clientCardHolder !== '' &&
        clientCardExpiration !== '' &&
        clientCardSecurityNumber !== '' &&
        password !== '' &&
        passwordConfirmation !== '')
    ) {
      if (password === passwordConfirmation) {
        if (
          userType !== '' &&
          sellerName !== '' &&
          email !== '' &&
          password !== '' &&
          passwordConfirmation !== ''
        ) {
          // Check the email format
          if (helpers.isValidEmail(email)) {
            // Seller check
            // Check if the email is already registered
            let emailCheck = await axios.get(
              `http://${secrets.LOCALHOST_IP}:${secrets.TOMCAT_PORT}/sales-system/sales?table=credenciales_usuarios&exists=${email}`
            );

            if (emailCheck.data.success) {
              if (!emailCheck.data.exists) {
                // Attempt to register the user
                let sellerRegistration = await axios.get(
                  `http://${secrets.LOCALHOST_IP}:${secrets.TOMCAT_PORT}/sales-system/sellers?post=true&vendedor=${sellerName}&crear=true`
                );

                if (sellerRegistration.data.success) {
                  let salt = helpers.getCryptoSalt(32);
                  let userCredentialsTableData = {
                    id_cliente: null,
                    id_vendedor: sellerRegistration.data.sellerId,
                    tipo_usuario: 'vendedor',
                    email: email,
                    salt: salt,
                    hash: helpers.getHashedPassword(password, salt),
                  };

                  let userCredentialsRegistration = await axios.post(
                    `http://${secrets.LOCALHOST_IP}:${secrets.TOMCAT_PORT}/sales-system/sales?table=credenciales_usuarios`,
                    userCredentialsTableData
                  );

                  if (userCredentialsRegistration.data.success) {
                    helpers.setLoginUserAttributes(
                      'vendedor',
                      sellerRegistration.data.sellerId,
                      sellerName
                    );
                    localStorage.setItem('isAdmin', false);
                    setLoading(false);
                    helpers.showOptionModal(
                      'Registro exitoso',
                      '¡Bienvenido a la tienda! Enseguida será redirigido a su página de tienda.',
                      () => {
                        navigate('/Catalogo-Ventas');
                      }
                    );
                  } else {
                    setLoading(false);
                    helpers.showModal(
                      'Ocurrió un error',
                      'Hubo un error al registrar sus datos. Por favor, inténtelo de nuevo.'
                    );
                  }
                } else {
                  setLoading(false);
                  helpers.showModal(
                    'Hubo un error',
                    'No se pudo registrar el vendedor. Por favor, inténtelo de nuevo.'
                  );
                }
              } else {
                setLoading(false);
                helpers.showModal(
                  'Correo electrónico ya registrado',
                  'El correo provisto ya se encuentra registrado. Por favor, ingrese otro correo electrónico.'
                );
              }
            } else {
              setLoading(false);
              helpers.showModal(
                'Ocurrió un error',
                'Hubo un error al verificar sus datos. Por favor inténtelo de nuevo'
              );
            }
          } else {
            setLoading(false);
            helpers.showModal(
              'Correo electrónico inválido',
              'El correo electrónico ingresado no es válido. Por favor, ingrese un correo electrónico válido.'
            );
          }
        } else if (
          userType !== '' &&
          clientType !== '' &&
          clientName !== '' &&
          email !== '' &&
          password !== '' &&
          passwordConfirmation !== '' &&
          clientNIT === ''
        ) {
          if (helpers.isValidEmail(email)) {
            // Individual client check
            // Check if the email is already registered
            let emailCheck = await axios.get(
              `http://${secrets.LOCALHOST_IP}:${secrets.TOMCAT_PORT}/sales-system/sales?table=credenciales_usuarios&exists=${email}`
            );

            if (emailCheck.data.success) {
              if (!emailCheck.data.exists) {
                // Attempt to register the user
                let clientRegistration = await axios.post(
                  `http://${secrets.LOCALHOST_IP}:${secrets.TOMCAT_PORT}/sales-system/sales?table=clientes`,
                  {
                    nombre: clientName,
                    nit: null,
                    email: null,
                    telefono: null,
                    patente_comercio: null,
                    tipo_cliente: 'individual',
                    tiene_suscripcion: 'False',
                    vencimiento_suscripcion: null,
                  }
                );

                if (clientRegistration.data.success) {
                  let salt = helpers.getCryptoSalt(32);
                  let userCredentialsTableData = {
                    id_cliente: clientRegistration.data.dataAdded.id_cliente,
                    id_vendedor: null,
                    tipo_usuario: 'cliente',
                    email: email,
                    salt: salt,
                    hash: helpers.getHashedPassword(password, salt),
                  };
                  let userCredentialsRegistration = await axios.post(
                    `http://${secrets.LOCALHOST_IP}:${secrets.TOMCAT_PORT}/sales-system/sales?table=credenciales_usuarios`,
                    userCredentialsTableData
                  );

                  if (userCredentialsRegistration.data.success) {
                    helpers.setLoginUserAttributes(
                      'individual',
                      clientRegistration.data.dataAdded.id_cliente,
                      clientName
                    );
                    setLoading(false);
                    helpers.showOptionModal(
                      'Registro exitoso',
                      '¡Bienvenido a la tienda! Enseguida será redirigido a su página de tienda.',
                      () => {
                        navigate('/Catalogo-Dispositivos');
                      }
                    );
                  } else {
                    setLoading(false);
                    helpers.showModal(
                      'Ocurrió un error',
                      'Hubo un error al registrar sus datos. Por favor, inténtelo de nuevo.'
                    );
                  }
                } else {
                  setLoading(false);
                  helpers.showModal(
                    'Hubo un error',
                    'No se pudo registrar el vendedor. Por favor, inténtelo de nuevo.'
                  );
                }
              } else {
                setLoading(false);
                helpers.showModal(
                  'Correo electrónico ya registrado',
                  'El correo provisto ya se encuentra registrado. Por favor, ingrese otro correo electrónico.'
                );
              }
            } else {
              setLoading(false);
              helpers.showModal(
                'Ocurrió un error',
                'Hubo un error al verificar sus datos. Por favor inténtelo de nuevo'
              );
            }
          } else {
            setLoading(false);
            helpers.showModal(
              'Correo electrónico inválido',
              'El correo electrónico ingresado no es válido. Por favor, ingrese un correo electrónico válido.'
            );
          }
        } else {
          // Large customer or distributor check
          let emailCheck = await axios.get(
            `http://${secrets.LOCALHOST_IP}:${secrets.TOMCAT_PORT}/sales-system/sales?table=credenciales_usuarios&exists=${email}`
          );

          if (emailCheck.data.success) {
            if (!emailCheck.data.exists) {
              let suscriptionExpiration = new Date(
                new Date().getTime() + 365 * 24 * 60 * 60 * 1000
              )
                .toISOString()
                .slice(0, 19)
                .replace('T', ' ');
              let formData = new FormData();
              formData.append(
                'fileName',
                `${helpers.replaceWhiteSpaces(
                  clientName,
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

              // Remove the beginning of the image url until the second colon
              let imageUrl = clientCommercePatentUpload.data.imgURL.slice(
                clientCommercePatentUpload.data.imgURL.indexOf(':') + 1
              );
              imageUrl = imageUrl.slice(imageUrl.indexOf(':'));

              // Attempt to register the user
              let clientRegistration = await axios.post(
                `http://${secrets.LOCALHOST_IP}:${secrets.TOMCAT_PORT}/sales-system/sales?table=clientes`,
                {
                  nombre: clientName,
                  nit: clientNIT,
                  email: email,
                  telefono: clientPhone,
                  patente_comercio: imageUrl,
                  tipo_cliente: clientType,
                  tiene_suscripcion: 'True',
                  vencimiento_suscripcion: suscriptionExpiration,
                }
              );

              if (clientRegistration.data.success) {
                let salt = helpers.getCryptoSalt(32);
                let userCredentialsTableData = {
                  id_cliente: clientRegistration.data.dataAdded.id_cliente,
                  id_vendedor: null,
                  tipo_usuario: 'cliente',
                  email: email,
                  salt: salt,
                  hash: helpers.getHashedPassword(password, salt),
                };
                let userCredentialsRegistration = await axios.post(
                  `http://${secrets.LOCALHOST_IP}:${secrets.TOMCAT_PORT}/sales-system/sales?table=credenciales_usuarios`,
                  userCredentialsTableData
                );

                if (userCredentialsRegistration.data.success) {
                  localStorage.setItem(
                    clientType,
                    clientRegistration.data.dataAdded.id_cliente
                  );
                  helpers.setLoginUserAttributes(
                    clientType,
                    clientRegistration.data.dataAdded.id_cliente,
                    clientName
                  );
                  setLoading(false);
                  helpers.showOptionModal(
                    'Registro exitoso',
                    '¡Bienvenido a la tienda! Enseguida será redirigido a su página de tienda.',
                    () => {
                      navigate('/Catalogo-Dispositivos');
                    }
                  );
                } else {
                  setLoading(false);
                  helpers.showModal(
                    'Ocurrió un error',
                    'Hubo un error al registrar sus datos. Por favor, inténtelo de nuevo.'
                  );
                }
              } else {
                setLoading(false);
                helpers.showModal(
                  'Hubo un error',
                  'No se pudo registrar el vendedor. Por favor, inténtelo de nuevo.'
                );
              }
            } else {
              setLoading(false);
              helpers.showModal(
                'Correo electrónico ya registrado',
                'El correo provisto ya se encuentra registrado. Por favor, ingrese otro correo electrónico.'
              );
            }
          } else {
            setLoading(false);
            helpers.showModal(
              'Ocurrió un error',
              'Hubo un error al verificar sus datos. Por favor inténtelo de nuevo'
            );
          }
        }
      } else {
        setLoading(false);
        helpers.showModal(
          'Error',
          'Las contraseñas no coinciden. Por favor, ingréselas nuevamente.'
        );
      }
    } else {
      setLoading(false);
      helpers.showModal(
        'Error',
        'Por favor, asegúrese de ingresar todos los datos solicitados.'
      );
    }
  };

  return (
    <>
      <form className="sign-in-form">
        <div className="container text-center">
          <img
            className="mb-4"
            src="/logo192.png"
            alt=""
            width="195"
            height="195"
          />
        </div>
        <h1 className="h3 mb-3 font-weight-normal text-center">
          Crear una Cuenta
        </h1>
        <label className="text">Tipo de Usuario</label>
        <section
          className="center"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            className="dropdown"
            style={{
              width: '100%',
            }}
          >
            <button
              id="userTypeDropdown"
              className="btn btn-primary dropdown-toggle"
              type="button"
              data-toggle="dropdown"
              aria-expanded="false"
              style={{
                backgroundColor: helpers.PALETTE.green,
                borderColor: helpers.PALETTE.green,
                width: '100%',
              }}
            >
              Tipo de Usuario
            </button>
            <div
              style={{
                height: '15px',
              }}
            ></div>
            <div
              id="usertype-dropdown-menu-options"
              className="dropdown-menu"
              aria-labelledby="userTypeDropdown"
            >
              <a
                className="dropdown-item"
                onClick={() => {
                  setUserType('cliente');
                  $('#userTypeDropdown').text('Cliente');
                  $('#usertype-dropdown-menu-options')
                    .children()
                    .removeClass('active');
                  $('#usertype-dropdown-menu-options')
                    .children()
                    .eq(0)
                    .addClass('active');
                }}
              >
                Cliente
              </a>
              <a
                className="dropdown-item"
                onClick={() => {
                  setUserType('vendedor');
                  $('#userTypeDropdown').text('Vendedor');
                  $('#usertype-dropdown-menu-options')
                    .children()
                    .removeClass('active');
                  $('#usertype-dropdown-menu-options')
                    .children()
                    .eq(1)
                    .addClass('active');
                }}
              >
                Vendedor
              </a>
            </div>
          </div>
        </section>
        {userType !== '' ? (
          userType === 'cliente' ? (
            <>
              <section
                className="center"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <div
                  className="dropdown"
                  style={{
                    width: '100%',
                  }}
                >
                  <button
                    id="clientTypeDropdown"
                    className="btn btn-primary dropdown-toggle"
                    type="button"
                    data-toggle="dropdown"
                    aria-expanded="false"
                    style={{
                      backgroundColor: helpers.PALETTE.green,
                      borderColor: helpers.PALETTE.green,
                      width: '100%',
                    }}
                  >
                    Tipo de Cliente
                  </button>
                  <div
                    style={{
                      height: '15px',
                    }}
                  ></div>
                  <div
                    id="clienttype-dropdown-menu-options"
                    className="dropdown-menu"
                    aria-labelledby="clientTypeDropdown"
                  >
                    <a
                      className="dropdown-item"
                      onClick={() => {
                        setClientType('individual');
                        $('#clientTypeDropdown').text('Cliente Individual');
                        $('#clienttype-dropdown-menu-options')
                          .children()
                          .removeClass('active');
                        $('#clienttype-dropdown-menu-options')
                          .children()
                          .eq(0)
                          .addClass('active');
                      }}
                    >
                      Cliente Individual
                    </a>
                    <a
                      className="dropdown-item"
                      onClick={() => {
                        setClientType('grande');
                        $('#clientTypeDropdown').text('Gran Cliente');
                        $('#clienttype-dropdown-menu-options')
                          .children()
                          .removeClass('active');
                        $('#clienttype-dropdown-menu-options')
                          .children()
                          .eq(1)
                          .addClass('active');
                      }}
                    >
                      Gran Cliente
                    </a>
                    <a
                      className="dropdown-item"
                      onClick={() => {
                        setClientType('distribuidor');
                        $('#clientTypeDropdown').text('Distribuidor Mayorista');
                        $('#clienttype-dropdown-menu-options')
                          .children()
                          .removeClass('active');
                        $('#clienttype-dropdown-menu-options')
                          .children()
                          .eq(2)
                          .addClass('active');
                      }}
                    >
                      Distribuidor Mayorista
                    </a>
                  </div>
                </div>
              </section>
              {clientType !== '' ? (
                clientType === 'individual' ? (
                  <>
                    <label htmlFor="clientName">Nombre</label>
                    <input
                      type="text"
                      id="clientName"
                      className="form-control text-input"
                      placeholder="Nombre"
                      required
                      onInvalid={(e) => {
                        e.target.setCustomValidity(
                          'Por favor, ingrese su nombre.'
                        );
                      }}
                      onChange={(e) => {
                        setClientName(e.target.value);
                      }}
                      style={{
                        backgroundColor: helpers.PALETTE.lightGray,
                      }}
                    />
                    <label htmlFor="clientEmail">Correo Electrónico</label>
                    <input
                      type="email"
                      id="clientEmail"
                      className="form-control email-input"
                      placeholder="Correo Electrónico"
                      required
                      onInvalid={(e) => {
                        e.target.setCustomValidity(
                          'Por favor, ingrese su correo electrónico.'
                        );
                      }}
                      onChange={(e) => {
                        setEmail(e.target.value);
                      }}
                      style={{
                        backgroundColor: helpers.PALETTE.lightGray,
                      }}
                    />
                    <label htmlFor="clientPassword">Contraseña</label>
                    <input
                      type="password"
                      id="clientPassword"
                      className="form-control text-input"
                      placeholder="Contraseña"
                      required
                      onInvalid={(e) => {
                        e.target.setCustomValidity(
                          'Por favor, ingrese su contraseña.'
                        );
                      }}
                      onChange={(e) => {
                        setPassword(e.target.value);
                      }}
                      style={{
                        backgroundColor: helpers.PALETTE.lightGray,
                      }}
                    />
                    <label htmlFor="clientPasswordConfirmation">
                      Confirmación de Contraseña
                    </label>
                    <input
                      type="password"
                      id="clientPasswordConfirmation"
                      className="form-control text-input"
                      placeholder="Confirmación de Contraseña"
                      required
                      onInvalid={(e) => {
                        e.target.setCustomValidity(
                          'Por favor, ingrese su contraseña nuevamente.'
                        );
                      }}
                      onChange={(e) => {
                        setPasswordConfirmation(e.target.value);
                      }}
                      style={{
                        backgroundColor: helpers.PALETTE.lightGray,
                      }}
                    />
                  </>
                ) : (
                  <>
                    <label htmlFor="clientName">Nombre</label>
                    <input
                      type="text"
                      id="clientName"
                      className="form-control text-input"
                      placeholder="Nombre"
                      required
                      onInvalid={(e) => {
                        e.target.setCustomValidity(
                          'Por favor, ingrese su nombre.'
                        );
                      }}
                      onChange={(e) => {
                        setClientName(e.target.value);
                      }}
                      style={{
                        backgroundColor: helpers.PALETTE.lightGray,
                      }}
                    />
                    <label htmlFor="clientNIT">NIT</label>
                    <input
                      type="text"
                      id="clientNIT"
                      className="form-control text-input"
                      placeholder="NIT"
                      required
                      onInvalid={(e) => {
                        e.target.setCustomValidity(
                          'Por favor, ingrese su NIT.'
                        );
                      }}
                      onChange={(e) => {
                        setClientNIT(e.target.value);
                      }}
                      style={{
                        backgroundColor: helpers.PALETTE.lightGray,
                      }}
                    />
                    <label htmlFor="clientEmail">Correo Electrónico</label>
                    <input
                      type="email"
                      id="clientEmail"
                      className="form-control email-input"
                      placeholder="Correo Electrónico"
                      required
                      onInvalid={(e) => {
                        e.target.setCustomValidity(
                          'Por favor, ingrese su correo electrónico.'
                        );
                      }}
                      onChange={(e) => {
                        setEmail(e.target.value);
                      }}
                      style={{
                        backgroundColor: helpers.PALETTE.lightGray,
                      }}
                    />
                    <label htmlFor="clientPhone">Teléfono</label>
                    <input
                      type="tel"
                      id="clientPhone"
                      className="form-control text-input"
                      placeholder="Teléfono"
                      required
                      onInvalid={(e) => {
                        e.target.setCustomValidity(
                          'Por favor, ingrese su número de teléfono.'
                        );
                      }}
                      onChange={(e) => {
                        if (e.target.value.length <= 8) {
                          setClientPhone(e.target.value);
                        } else {
                          e.target.value = e.target.value.slice(0, 8);
                        }
                      }}
                      style={{
                        backgroundColor: helpers.PALETTE.lightGray,
                      }}
                    />
                    <label htmlFor="clientComercePatent">
                      Patente de Comercio
                    </label>
                    <input
                      type="file"
                      id="clientComercePatent"
                      className="form-control text-input"
                      placeholder="Patente de Comercio"
                      required
                      onInvalid={(e) => {
                        e.target.setCustomValidity(
                          'Por favor, ingrese su patente de comercio.'
                        );
                      }}
                      onChange={(e) => {
                        setClientComPat(e.target.files[0]);
                      }}
                      style={{
                        backgroundColor: helpers.PALETTE.lightGray,
                      }}
                    />
                    <div className="payment-title">
                      <p>Información de Pago</p>
                    </div>
                    <label htmlFor="cardHolderName">
                      Nombre del Titular de la Tarjeta
                    </label>
                    <input
                      className="form-control text-input"
                      id="cardHolderName"
                      maxLength="20"
                      type="text"
                      placeholder="Nombre del Titular de la Tarjeta"
                      required
                      onInvalid={(e) => {
                        e.target.setCustomValidity(
                          'Por favor, ingrese el nombre del titular de la tarjeta.'
                        );
                      }}
                      onChange={(e) => {
                        setClientCardHolder(e.target.value);
                      }}
                      style={{
                        backgroundColor: helpers.PALETTE.lightGray,
                      }}
                    />
                    <label htmlFor="expirationDate">
                      Fecha de Expiración (mm/aa)
                    </label>
                    <input
                      className="form-control text-input"
                      id="expirationDate"
                      type="text"
                      pattern="[0-9]*"
                      inputMode="numeric"
                      placeholder="Fecha de Expiración"
                      required
                      onInvalid={(e) => {
                        e.target.setCustomValidity(
                          'Por favor, ingrese la fecha de expiración de la tarjeta.'
                        );
                      }}
                      onChange={(e) => {
                        setClientCardExpiration(e.target.value);
                      }}
                      style={{
                        backgroundColor: helpers.PALETTE.lightGray,
                      }}
                    />
                    <label htmlFor="securityCode">Código de Seguridad</label>
                    <input
                      className="form-control text-input"
                      id="securityCode"
                      type="text"
                      pattern="[0-9]*"
                      inputMode="numeric"
                      placeholder="Código de Seguridad"
                      required
                      onInvalid={(e) => {
                        e.target.setCustomValidity(
                          'Por favor, ingrese el código de seguridad de la tarjeta.'
                        );
                      }}
                      onChange={(e) => {
                        setClientCardSecurityNumber(e.target.value);
                      }}
                      style={{
                        backgroundColor: helpers.PALETTE.lightGray,
                      }}
                    />
                    <label htmlFor="clientPassword">Contraseña</label>
                    <input
                      type="password"
                      id="clientPassword"
                      className="form-control text-input"
                      placeholder="Contraseña"
                      required
                      onInvalid={(e) => {
                        e.target.setCustomValidity(
                          'Por favor, ingrese su contraseña.'
                        );
                      }}
                      onChange={(e) => {
                        setPassword(e.target.value);
                      }}
                      style={{
                        backgroundColor: helpers.PALETTE.lightGray,
                      }}
                    />
                    <label htmlFor="clientPasswordConfirmation">
                      Confirmación de Contraseña
                    </label>
                    <input
                      type="password"
                      id="clientPasswordConfirmation"
                      className="form-control text-input"
                      placeholder="Confirmación de Contraseña"
                      required
                      onInvalid={(e) => {
                        e.target.setCustomValidity(
                          'Por favor, ingrese su contraseña nuevamente.'
                        );
                      }}
                      onChange={(e) => {
                        setPasswordConfirmation(e.target.value);
                      }}
                      style={{
                        backgroundColor: helpers.PALETTE.lightGray,
                      }}
                    />
                  </>
                )
              ) : (
                <></>
              )}
            </>
          ) : (
            <>
              <label htmlFor="sellerName">Nombre Comercial</label>
              <input
                type="text"
                id="sellerName"
                className="form-control text-input"
                placeholder="Nombre Comercial"
                required
                onInvalid={(e) => {
                  e.target.setCustomValidity(
                    'Por favor, ingrese su nombre comercial.'
                  );
                }}
                onChange={(e) => {
                  setSellerName(e.target.value);
                }}
                style={{
                  backgroundColor: helpers.PALETTE.lightGray,
                }}
              />
              <label htmlFor="sellerEmail">Correo Electrónico</label>
              <input
                type="email"
                id="sellerEmail"
                className="form-control email-input"
                placeholder="Correo Electrónico"
                required
                onInvalid={(e) => {
                  e.target.setCustomValidity(
                    'Por favor, ingrese su correo electrónico.'
                  );
                }}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                style={{
                  backgroundColor: helpers.PALETTE.lightGray,
                }}
              />
              <label htmlFor="sellerPassword">Contraseña</label>
              <input
                type="password"
                id="sellerPassword"
                className="form-control text-input"
                placeholder="Contraseña"
                required
                onInvalid={(e) => {
                  e.target.setCustomValidity(
                    'Por favor, ingrese su contraseña.'
                  );
                }}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                style={{
                  backgroundColor: helpers.PALETTE.lightGray,
                }}
              />
              <label htmlFor="sellerPasswordConfirmation">
                Confirmación de Contraseña
              </label>
              <input
                type="password"
                id="sellerPasswordConfirmation"
                className="form-control text-input"
                placeholder="Confirmación de Contraseña"
                required
                onInvalid={(e) => {
                  e.target.setCustomValidity(
                    'Por favor, ingrese su contraseña nuevamente.'
                  );
                }}
                onChange={(e) => {
                  setPasswordConfirmation(e.target.value);
                }}
                style={{
                  backgroundColor: helpers.PALETTE.lightGray,
                }}
              />
            </>
          )
        ) : (
          <></>
        )}
        <button
          className="btn btn-lg btn-primary btn-block sign-in-btn"
          onClick={(e) => {
            e.preventDefault();
            handleCredentialsSubmission();
          }}
          style={{
            backgroundColor: helpers.PALETTE.darkGreen,
            borderColor: helpers.PALETTE.darkGreen,
          }}
        >
          Crear Cuenta
        </button>
        <section className="login-bottom-text">
          <p className="mt-3 mb-3 text-muted text-center">
            <b>{'¿Ya tienes una cuenta?'}</b>
            &nbsp;
            <Link to="/login">Iniciar Sesión</Link>
          </p>
        </section>
      </form>
      {loading ? <Loader loading={loading} /> : <></>}
    </>
  );
}

export default SignUpForm;

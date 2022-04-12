import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import helpers from '../../helpers/helpers';
import { useNavigate } from 'react-router-dom';
import Loader from '../molecules/Loader';
import secrets from '../../helpers/secrets';
import $ from 'jquery';

function LoginForm() {
  const [userType, setUserType] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    if (
      helpers.isLoggedIn() &&
      localStorage.getItem('userType') !== 'fabricante'
    ) {
      navigate('/Catalogo-Ventas');
    } else if (helpers.isLoggedIn()) {
      // navigate('/Catalogo-Ventas');
    }

    $('#usertype-dropdown-menu-options').children().eq(0).tooltip({
      placement: 'right',
      trigger: 'hover',
      title: 'Permite el registro de dispositivos electrónicos para su venta.',
    });
    $('#usertype-dropdown-menu-options').children().eq(1).tooltip({
      placement: 'right',
      trigger: 'hover',
      title:
        'Permite realizar compras de los dispositivos electrónicos que ofrecen los fabricantes.',
    });
  }, []);

  // Handlers
  const handleCredentialsSubmission = async () => {
    setLoading(true);

    // Check the user has selected a user type
    if (userType !== '') {
      // Check that all the fields are filled
      if (email !== '' && password !== '') {
        if (userType === 'fabricante') {
          // Check that a user with the given email exists
          const emailCheck = await axios.get(
            `http://localhost:3002/factories?emailExists=${email}`
          );

          if (emailCheck.data.success) {
            if (emailCheck.data.emailExists) {
              const userData = emailCheck.data.data;
              const salt = userData.salt;
              const hash = userData.hash;

              if (helpers.isValidPassword(password, salt, hash)) {
                localStorage.setItem('loggedIn', true);
                localStorage.setItem('userType', userType);
                localStorage.setItem('name', userData.name);
                localStorage.setItem('id', userData._id);
                setLoading(false);
                helpers.showOptionModal(
                  'Bienvenido',
                  'Enseguida será redirigido a la página principal.',
                  () => {
                    navigate('/Catalogo-Ventas');
                  }
                );
              } else {
                setLoading(false);
                helpers.showModal(
                  'Credenciales inválidas',
                  'Correo electrónico o contraseña incorrectos. Por favor, asegúrese de haberlas escrito correctamente.'
                );
              }
            } else {
              setLoading(false);
              helpers.showModal(
                'Credenciales inválidas',
                'Correo electrónico o contraseña incorrectos. Por favor, asegúrese de haberlas escrito correctamente.'
              );
            }
          } else {
            setLoading(false);
            helpers.showModal(
              'Error',
              'Ocurrió un error. Por favor inténtelo de nuevo más tarde.'
            );
          }
        } else {
          const emailCheck = await axios.get(
            `http://localhost:3003/?sellerEmail=${email}`
          );

          if (emailCheck.data.success) {
            const user = emailCheck.data.data;

            if (emailCheck.data.userExists) {
              const salt = user.salt;
              const hash = user.hash;

              if (helpers.isValidPassword(password, salt, hash)) {
                localStorage.setItem('loggedIn', true);
                localStorage.setItem('userType', userType);
                localStorage.setItem('name', user.nombre);
                setLoading(false);
                helpers.showOptionModal(
                  'Bienvenido',
                  'Enseguida será redirigido a la página principal.',
                  () => {
                    // navigate('/Catalogo-Dispositivos');
                    navigate('/');
                  }
                );
              } else {
                setLoading(false);
                helpers.showModal(
                  'Credenciales inválidas',
                  'Correo electrónico o contraseña incorrectos. Por favor, asegúrese de haberlas escrito correctamente.'
                );
              }
            } else {
              setLoading(false);
              helpers.showModal(
                'Credenciales inválidas',
                'Correo electrónico o contraseña incorrectos. Por favor, asegúrese de haberlas escrito correctamente.'
              );
            }
          } else {
            setLoading(false);
            helpers.showModal(
              'Error',
              'Ocurrió un error. Por favor inténtelo de nuevo más tarde.'
            );
          }
        }
      } else {
        setLoading(false);
        helpers.showModal(
          'Datos incompletos',
          'Por favor, ingrese todos los campos solicitados.'
        );
      }
    } else {
      setLoading(false);
      helpers.showModal(
        'Tipo de usuario no seleccionado',
        'Por favor, seleccione un tipo de usuario.'
      );
    }
  };

  return (
    <>
      <form className="login-form">
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
          Iniciar Sesión
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
                backgroundColor: helpers.PALETTE.blue,
                borderColor: helpers.PALETTE.blue,
                width: '100%',
              }}
            >
              Tipo de Usuario
            </button>
            <div
              style={{
                height: '10px',
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
                  setUserType('fabricante');
                  $('#userTypeDropdown').text('Fabricante');
                  $('#usertype-dropdown-menu-options')
                    .children()
                    .removeClass('active');
                  $('#usertype-dropdown-menu-options')
                    .children()
                    .eq(0)
                    .addClass('active');
                }}
              >
                Fabricante
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
        <label htmlFor="inputEmail" className="email-input-label">
          Correo Electrónico
        </label>
        <input
          type="text"
          id="inputEmail"
          className="form-control text-input"
          placeholder="Correo electrónico"
          required
          onInvalid={(e) => {
            e.target.setCustomValidity(
              'Por favor, ingrese su correo electrónico'
            );
          }}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          style={{
            backgroundColor: helpers.PALETTE.lightGray,
          }}
        />
        <label htmlFor="inputPassword">Contraseña</label>
        <input
          type="password"
          id="inputPassword"
          className="form-control text-input"
          placeholder="Password"
          required
          onInvalid={(e) => {
            e.target.setCustomValidity('Por favor, ingrese su nombre.');
          }}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          style={{
            backgroundColor: helpers.PALETTE.lightGray,
          }}
        />
        <button
          className="btn btn-lg btn-primary btn-block login-btn"
          type="submit"
          onClick={(e) => {
            e.preventDefault();
            handleCredentialsSubmission();
          }}
          style={{
            backgroundColor: helpers.PALETTE.darkGreen,
            borderColor: helpers.PALETTE.darkGreen,
          }}
        >
          Iniciar Sesión
        </button>
        <section className="login-bottom-text">
          <p className="mt-3 mb-3 text-muted text-center">
            <b>{'¿No tienes una cuenta?'}</b>
            &nbsp;
            <Link to="/sign-up">Registrarse</Link>
          </p>
        </section>
      </form>
      {loading ? <Loader loading={loading} /> : <></>}
    </>
  );
}

export default LoginForm;


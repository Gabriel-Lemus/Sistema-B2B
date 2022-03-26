import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import helpers from '../../helpers/helpers';
import { useNavigate } from 'react-router-dom';
import Loader from '../molecules/Loader';

function LoginForm() {
  // State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Effects
  useEffect(() => {
    // Check if user is logged in
    if (helpers.isLoggedIn()) {
      navigate('/Catalogo-Dispositivos');
    }
  }, []);

  // Handlers
  const handleCredentialsSubmission = () => {
    setLoading(true);
    if (email === '' || password === '') {
      setLoading(false);
      helpers.showModal(
        'Campos vacíos',
        'Por favor, ingrese su correo electrónico y contraseña.'
      );
    } else {
      (async () => {
        const parsedEmail = email.replace(/\+/g, '%2b');
        let checkEmailExists = await axios.get(
          `http://${helpers.LOCALHOST_IP}:${helpers.TOMCAT_PORT}/sales-system/sales?table=credenciales_usuarios&exists=${parsedEmail}`
        );
        if (checkEmailExists.data.success) {
          if (helpers.isValidEmail(email)) {
            if (checkEmailExists.data.exists) {
              let credentials = await axios.get(
                `http://${helpers.LOCALHOST_IP}:${helpers.TOMCAT_PORT}/sales-system/sales?table=credenciales_usuarios&getEmail=${parsedEmail}`
              );
              if (
                helpers.isValidPassword(
                  password,
                  credentials.data.salt,
                  credentials.data.hash
                )
              ) {
                if (credentials.data.tipo_usuario === 'cliente') {
                  let client = await axios.get(
                    `http://localhost:8080/sales-system/sales?table=clientes&id=${credentials.data.id_cliente}`
                  );
                  helpers.setLoginUserAttributes(
                    client.data.data.tipo_cliente,
                    client.data.data.id_cliente,
                    client.data.data.nombre
                  );
                  setLoading(false);
                  navigate('/Catalogo-Dispositivos');
                } else {
                  let seller = await axios.get(
                    `http://localhost:8080/sales-system/sales?table=vendedores&id=${credentials.data.id_vendedor}`
                  );
                  helpers.setLoginUserAttributes(
                    'vendedor',
                    credentials.data.id_vendedor,
                    seller.data.data.nombre
                  );
                  setLoading(false);
                  navigate('/Catalogo-Dispositivos');
                }
              } else {
                setLoading(false);
                helpers.showModal(
                  'Credenciales incorrectas',
                  'Por favor, asegúrese de haber ingresado su correo electrónico y contraseña correctamente.'
                );
              }
            } else {
              setLoading(false);
              helpers.showModal(
                'Correo electrónico no registrado',
                'El correo electrónico ingresado no se encuentra registrado. Por favor, asegúrese de haber ingresado el correo electrónico correctamente.'
              );
            }
          } else {
            setLoading(false);
            helpers.showModal(
              'Correo electrónico inválido',
              'Por favor, asegúrese de ingresar un correo electrónico válido.'
            );
          }
        } else {
          setLoading(false);
          helpers.showModal(
            'Error',
            'Ocurrió un error. Por favor, intente nuevamente.'
          );
        }
      })();
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

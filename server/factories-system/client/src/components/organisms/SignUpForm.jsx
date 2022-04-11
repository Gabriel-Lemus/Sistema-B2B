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
  const [factoryName, setFactoryName] = useState('');
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
      localStorage.getItem('userType') !== 'fabricante'
    ) {
      // navigate('/Catalogo-Dispositivos');
    } else if (helpers.isLoggedIn()) {
      // navigate('/Catalogo-Ventas');
    }
  }, []);

  // Handlers
  /**
   * Handle the validation and submission of the credentials when the sign up button is clicked.
   */
  const handleCredentialsSubmission = async () => {
    setLoading(true);

    // Check that all fields are filled
    if (
      factoryName !== '' &&
      email !== '' &&
      password !== '' &&
      passwordConfirmation !== ''
    ) {
      // Check that the passwords match
      if (password === passwordConfirmation) {
        // Check that the provided email is valid
        if (helpers.isValidEmail(email)) {
          // Check that the email is not already registered
          const vacantEmail = await axios.get(
            `http://localhost:3002/factory?emailExists=${email}&factoryExists=${factoryName}`
          );

          if (vacantEmail.data.canAddFactory) {
            const salt = helpers.getCryptoSalt(32);
            const hash = helpers.getHashedPassword(password, salt);
            const newFactory = {
              name: factoryName,
              email,
              salt,
              hash,
            };
            const newFactoryResponse = await axios.post(
              `http://localhost:3002/factory`,
              newFactory
            );

            if (newFactoryResponse.data.success) {
              localStorage.setItem('loggedIn', true);
              localStorage.setItem('userType', 'fabricante');
              localStorage.setItem('name', factoryName);
              setLoading(false);
              helpers.showOptionModal(
                'Registro exitoso',
                'Se ha registrado exitosamente, ahora será redirigido a su catálogo de dispositivos.',
                () => {
                  // navigate('/Catalogo-Dispositivos');
                  navigate('/');
                }
              );
            }
          } else {
            helpers.showModal(
              'Datos ya registrados',
              'Una fábrica ya se ha registrado con el mismo nombre o correo electrónico que ha ingresado. Por favor, intente con otro correo electrónico o nombre de fábrica.'
            );
          }
        } else {
          helpers.showModal(
            'Correo electrónico inválido',
            'Por favor, ingrese un correo electrónico válido.'
          );
        }
      } else {
        setLoading(false);
        helpers.showModal(
          'Las contraseñas no coinciden',
          'Las contraseñas no coinciden, por favor, intente de nuevo.'
        );
      }
    } else {
      setLoading(false);
      helpers.showModal(
        'Datos incompletos',
        'Por favor, ingrese todos los datos solicitados.'
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
        <h1 className="h3 mb-3 font-weight-normal text-center">Registrarse</h1>
        <label htmlFor="factoryName">Nombre de la Fábrica</label>
        <input
          type="text"
          id="factoryName"
          className="form-control text-input"
          placeholder="Nombre de la Fábrica"
          required
          onInvalid={(e) => {
            e.target.setCustomValidity(
              'Por favor, ingrese el nombre de la fábrica.'
            );
          }}
          onChange={(e) => {
            setFactoryName(e.target.value);
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
            e.target.setCustomValidity('Por favor, ingrese su contraseña.');
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


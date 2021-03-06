import React, { useState, useEffect } from 'react';
import axios from 'axios';
import $ from 'jquery';
import { Link } from 'react-router-dom';
import helpers from '../../helpers/helpers';
import { useNavigate } from 'react-router-dom';
import Loader from '../molecules/Loader';
import secrets from '../../helpers/secrets';

function SignUpForm() {
  const [factoryName, setFactoryName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
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
      navigate('/Catalogo-Dispositivos');
    }
  }, []);

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
            `http://${secrets.LOCALHOST_IP}:${secrets.FACTORIES_BACKEND_PORT}/factories?emailExists=${email}&factoryExists=${factoryName}`
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
              `http://${secrets.LOCALHOST_IP}:${secrets.FACTORIES_BACKEND_PORT}/factories`,
              newFactory
            );
            const addFactoryAsBrand = await axios.post(
              `http://${secrets.LOCALHOST_IP}:${secrets.WEBSERVICES_PORT}/?newBrand=${factoryName}`,
              {}
            );

            if (
              newFactoryResponse.data.success &&
              addFactoryAsBrand.data.success
            ) {
              localStorage.setItem('loggedIn', true);
              localStorage.setItem('userType', 'fabricante');
              localStorage.setItem('name', factoryName);
              localStorage.setItem('id', newFactoryResponse.data.dataAdded._id);
              setLoading(false);
              helpers.showOptionModal(
                'Registro exitoso',
                'Se ha registrado exitosamente, ahora ser?? redirigido a su cat??logo de dispositivos.',
                () => {
                  navigate('/Catalogo-Ventas');
                }
              );
            }
          } else {
            helpers.showModal(
              'Datos ya registrados',
              'Una f??brica ya se ha registrado con el mismo nombre o correo electr??nico que ha ingresado. Por favor, intente con otro correo electr??nico o nombre de f??brica.'
            );
          }
        } else {
          helpers.showModal(
            'Correo electr??nico inv??lido',
            'Por favor, ingrese un correo electr??nico v??lido.'
          );
        }
      } else {
        setLoading(false);
        helpers.showModal(
          'Las contrase??as no coinciden',
          'Las contrase??as no coinciden, por favor, intente de nuevo.'
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
        <label htmlFor="factoryName">Nombre de la F??brica</label>
        <input
          type="text"
          id="factoryName"
          className="form-control text-input"
          placeholder="Nombre de la F??brica"
          required
          onInvalid={(e) => {
            e.target.setCustomValidity(
              'Por favor, ingrese el nombre de la f??brica.'
            );
          }}
          onChange={(e) => {
            setFactoryName(e.target.value);
          }}
          style={{
            backgroundColor: helpers.PALETTE.lightGray,
          }}
        />
        <label htmlFor="sellerEmail">Correo Electr??nico</label>
        <input
          type="email"
          id="sellerEmail"
          className="form-control email-input"
          placeholder="Correo Electr??nico"
          required
          onInvalid={(e) => {
            e.target.setCustomValidity(
              'Por favor, ingrese su correo electr??nico.'
            );
          }}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          style={{
            backgroundColor: helpers.PALETTE.lightGray,
          }}
        />
        <label htmlFor="sellerPassword">Contrase??a</label>
        <input
          type="password"
          id="sellerPassword"
          className="form-control text-input"
          placeholder="Contrase??a"
          required
          onInvalid={(e) => {
            e.target.setCustomValidity('Por favor, ingrese su contrase??a.');
          }}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          style={{
            backgroundColor: helpers.PALETTE.lightGray,
          }}
        />
        <label htmlFor="sellerPasswordConfirmation">
          Confirmaci??n de Contrase??a
        </label>
        <input
          type="password"
          id="sellerPasswordConfirmation"
          className="form-control text-input"
          placeholder="Confirmaci??n de Contrase??a"
          required
          onInvalid={(e) => {
            e.target.setCustomValidity(
              'Por favor, ingrese su contrase??a nuevamente.'
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
            <b>{'??Ya tienes una cuenta?'}</b>
            &nbsp;
            <Link to="/login">Iniciar Sesi??n</Link>
          </p>
        </section>
      </form>
      {loading ? <Loader loading={loading} /> : <></>}
    </>
  );
}

export default SignUpForm;


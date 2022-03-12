import React from 'react';
import { Link } from 'react-router-dom';
import helpers from '../../helpers/helpers';

function LoginForm() {
  return (
    <form className="login-form">
      <div className="container text-center">
        <img
          className="mb-4"
          src="/logo192.png"
          alt=""
          width="72"
          height="72"
        />
      </div>
      <h1 className="h3 mb-3 font-weight-normal text-center">Iniciar Sesión</h1>
      <label htmlFor="inputEmail" className="email-input-label">
        Email address
      </label>
      <input
        type="email"
        id="inputEmail"
        className="form-control email-input"
        placeholder="Email address"
        required
        autoFocus
        style={{
          backgroundColor: helpers.PALETTE.lightestGreen,
        }}
      />
      <label htmlFor="inputPassword">Password</label>
      <input
        type="password"
        id="inputPassword"
        className="form-control"
        placeholder="Password"
        required
        style={{
          backgroundColor: helpers.PALETTE.lightestGreen,
        }}
      />
      <section className="login-bottom-text">
        <p className="mt-3 mb-3 text-muted text-center">
          <Link to="/">Forgot your password?</Link>
        </p>
      </section>
      <button
        className="btn btn-lg btn-primary btn-block login-btn"
        type="submit"
        style={{
          backgroundColor: helpers.PALETTE.darkGreen,
          borderColor: helpers.PALETTE.darkGreen,
        }}
      >
        Iniciar Sesión
      </button>
      <section className="login-bottom-text">
        <p className="mt-3 mb-3 text-muted text-center">
          <b>{"Don't have an accout?"}</b>
          &nbsp;
          <Link to="/sign-up">Registrarse</Link>
        </p>
      </section>
    </form>
  );
}

export default LoginForm;

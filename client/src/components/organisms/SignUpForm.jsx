import React from 'react';
import { Link } from 'react-router-dom';
import helpers from '../../helpers/helpers';

function SignUpForm() {
  return (
    <form className="sign-in-form">
      <div className="container text-center">
        <img
          className="mb-4"
          src="/logo192.png"
          alt=""
          width="72"
          height="72"
        />
      </div>
      <h1 className="h3 mb-3 font-weight-normal text-center">Sign Up</h1>
      <section className="input-row">
        <section className="input-column">
          <label htmlFor="nameInput">Name</label>
          <input
            type="text"
            id="nameInput"
            className="form-control text-input"
            placeholder="Name"
            required
            autoFocus
            onInvalid={(e) => {
              e.target.setCustomValidity('Please enter your name.');
            }}
            style={{
              backgroundColor: helpers.PALETTE.lightestGreen,
            }}
          />
        </section>
        <section className="input-column-2">
          <label htmlFor="lastNameInput">Last name</label>
          <input
            type="text"
            id="lastNameInput"
            className="form-control text-input"
            placeholder="Last name"
            required
            onInvalid={(e) => {
              e.target.setCustomValidity('Please enter your last name.');
            }}
            style={{
              backgroundColor: helpers.PALETTE.lightestGreen,
            }}
          />
        </section>
      </section>
      <label htmlFor="inputEmail">Email address</label>
      <input
        type="email"
        id="inputEmail"
        className="form-control email-input"
        placeholder="Email address"
        required
        onInvalid={(e) => {
          e.target.setCustomValidity('Please enter your email address.');
        }}
        style={{
          backgroundColor: helpers.PALETTE.lightestGreen,
        }}
      />
      <label htmlFor="inputPassword">Password</label>
      <input
        type="password"
        id="inputPassword"
        className="form-control text-input"
        placeholder="Password"
        required
        onInvalid={(e) => {
          e.target.setCustomValidity('Please enter your password.');
        }}
        style={{
          backgroundColor: helpers.PALETTE.lightestGreen,
        }}
      />
      <label htmlFor="passwordConfirmation">Password Confirmation</label>
      <input
        type="password"
        id="passwordConfirmation"
        className="form-control"
        placeholder="Password Confirmation"
        required
        onInvalid={(e) => {
          e.target.setCustomValidity('Please enter your password again.');
        }}
        style={{
          backgroundColor: helpers.PALETTE.lightestGreen,
        }}
      />
      <button
        className="btn btn-lg btn-primary btn-block sign-in-btn"
        type="submit"
        style={{
          backgroundColor: helpers.PALETTE.darkGreen,
          borderColor: helpers.PALETTE.darkGreen,
        }}
      >
        Sign in
      </button>
      <section className="login-bottom-text">
        <p className="mt-3 mb-3 text-muted text-center">
          <b>{"Already have an accout?"}</b>
          &nbsp;
          <Link to="/login">Login</Link>
        </p>
      </section>
    </form>
  );
}

export default SignUpForm;

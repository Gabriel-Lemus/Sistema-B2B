import React from 'react';
import { Link } from 'react-router-dom';

function Navbar(props) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
      <a className="navbar-brand" href="/">
        <img
          src="/logo192.png"
          width="30"
          height="30"
          className="d-inline-block align-top navbar-img"
          alt="Sistema B2B logo"
        />
        {'Sistema B2B'}
      </a>
      <button
        className="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <div
        className="collapse navbar-collapse justify-content-end"
        id="navbarSupportedContent"
      >
        <ul className="navbar-nav">
          <li
            className={`nav-item${props.activePageIdx === 0 ? ' active' : ''}`}
          >
            <Link className="nav-link" to="/">
              Inicio{' '}
              {props.activePageIdx === 0 ? (
                <span className="sr-only">(current)</span>
              ) : (
                <></>
              )}
            </Link>
          </li>
          <li
            className={`nav-item${props.activePageIdx === 1 ? ' active' : ''}`}
          >
            <Link className="nav-link" to="/catalogo-dispositivos">
              Catálogo{' '}
              {props.activePageIdx === 1 ? (
                <span className="sr-only">(current)</span>
              ) : (
                <></>
              )}
            </Link>
          </li>
          <li
            className={`nav-item${props.activePageIdx === 1 ? ' active' : ''}`}
          >
            <Link className="nav-link" to="/login">
              Iniciar Sesión{' '}
              {props.activePageIdx === 1 ? (
                <span className="sr-only">(current)</span>
              ) : (
                <></>
              )}
            </Link>
          </li>
          <li
            className={`nav-item${props.activePageIdx === 2 ? ' active' : ''}`}
          >
            <Link className="nav-link" to="/sign-up">
              Registrarse{' '}
              {props.activePageIdx === 2 ? (
                <span className="sr-only">(current)</span>
              ) : (
                <></>
              )}
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;

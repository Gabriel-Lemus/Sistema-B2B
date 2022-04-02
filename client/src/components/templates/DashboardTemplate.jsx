import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import $ from 'jquery';
import helpers from '../../helpers/helpers';

function DashboardTemplate(props) {
  const navigate = useNavigate();
  const [searchParam, setSearchParam] = useState('');

  useEffect(() => {
    setTimeout(() => {
      $('#sidebarMenu').css('height', $(document).height());
    }, 1000);
  }, []);

  return (
    <>
      <nav className="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0 shadow">
        <div className="navbar-brand col-md-3 col-lg-2 mr-0 px-3">
          Sistema B2B
        </div>
        {props.displaySearchBar ? (
          <div className="input-group mb-2 mt-2">
            <input
              type="text"
              className="form-control"
              placeholder="Búsqueda de dispositivos"
              aria-label="Búsqueda de dispositivos"
              aria-describedby="button-addon"
              onChange={(e) => setSearchParam(e.target.value)}
            />
            <div className="input-group-append">
              <button
                className="btn btn-primary"
                type="button"
                id="button-addon2"
                onClick={() => {
                  if (searchParam !== '') {
                    navigate('/catalogo-dispositivos-busqueda', {
                      state: {
                        searchParam: searchParam,
                      },
                    });
                  }
                }}
              >
                Buscar
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                id="button-addon2"
                onClick={() => {
                  navigate('/busqueda-especializada');
                }}
              >
                Búsqueda especializada
              </button>
            </div>
          </div>
        ) : (
          <></>
        )}
        <ul className="navbar-nav px-3">
          <li className="nav-item text-nowrap">
            <a
              className="nav-link"
              onClick={() => {
                helpers.removeLoginUserAttributes();
                navigate('/');
              }}
            >
              Cerrar Sesión
            </a>
          </li>
        </ul>
      </nav>
      <div className="container-fluid">
        <div className="row">
          <nav
            id="sidebarMenu"
            className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse"
          >
            <div className="sidebar-sticky pt-3">
              <ul className="nav flex-column">
                {props.sideBarItems.map((item, index) => (
                  <li key={index} className="nav-item">
                    <Link className="nav-link sidebar-link" to={item.reference}>
                      {item.icon}
                      &nbsp;&nbsp;
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
          <main role="main" className="col-md-9 ml-sm-auto col-lg-10 px-md-4">
            <h1 className="mt-3">{props.pageTitle}</h1>
            {props.children}
          </main>
        </div>
      </div>
    </>
  );
}

export default DashboardTemplate;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function DashboardTemplate(props) {
  const navigate = useNavigate();
  const [searchParam, setSearchParam] = useState('');

  return (
    <>
      <nav className="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0 shadow">
        <a className="navbar-brand col-md-3 col-lg-2 mr-0 px-3" href="#">
          Sistema B2B
        </a>
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
                    navigate('/');
                    setTimeout(() => {
                      navigate(
                        `/catalogo-dispositivos-busqueda/${searchParam}`
                      );
                    }, 1);
                  }
                }}
              >
                Buscar
              </button>
            </div>
          </div>
        ) : (
          <></>
        )}
        <ul className="navbar-nav px-3">
          <li className="nav-item text-nowrap">
            <a className="nav-link" href="#">
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
                    <a className="nav-link sidebar-link" href={item.reference}>
                      {item.icon}
                      &nbsp;&nbsp;
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
          <main role="main" className="col-md-9 ml-sm-auto col-lg-10 px-md-4">
            <h1>{props.pageTitle}</h1>
            {props.children}
          </main>
        </div>
      </div>
    </>
  );
}

export default DashboardTemplate;

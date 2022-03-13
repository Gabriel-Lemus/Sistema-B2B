import React from 'react';
import { BiHome } from 'react-icons/bi';

function DashboardTemplate(props) {
  return (
    <>
      <nav className="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0 shadow">
        <a className="navbar-brand col-md-3 col-lg-2 mr-0 px-3" href="#">
          Sistema B2B
        </a>
        {props.displaySearchBar ? (
          <>
            <button
              className="navbar-toggler position-absolute d-md-none collapsed"
              type="button"
              data-toggle="collapse"
              data-target="#sidebarMenu"
              aria-controls="sidebarMenu"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <input
              className="form-control form-control-dark w-100"
              type="text"
              placeholder="Search"
              aria-label="Search"
            />
          </>
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
                    <a className="nav-link active" href={item.reference}>
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

import React from 'react';
import $ from 'jquery';
import MainHeader from '../atoms/MainHeader';
import SubHeader from '../atoms/SubHeader';
import helpers from '../../helpers/helpers';

function Header() {
  return (
    <header className="masthead text-center text-light page-header">
      <div className="masthead-content">
        <div className="container px-10">
          <MainHeader>
            {"Sistema B2B"}
          </MainHeader>
          <SubHeader>
            {"Un sistema interempresarial para la venta y compra de dispositivos electrónicos"}
          </SubHeader>
          <button
            id="btn-get-started"
            className="btn btn-primary btn-sl rounded-pill mt-5 font-weight-bold"
            onClick={() => {
              $('html, body').animate(
                {
                  scrollTop: $('#scroll').offset().top - 55,
                },
                1000
              );
            }}
            style={{
              backgroundColor: helpers.PALETTE.darkGreen,
              borderColor: helpers.PALETTE.darkGreen,
              padding: '0.5rem 1rem',
            }}
          >
            {"¡Vamos a ello!"}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;

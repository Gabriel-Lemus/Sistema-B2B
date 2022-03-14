import React from 'react';
import { Link } from 'react-router-dom';
import helpers from '../../helpers/helpers';

function NotFound() {
  return (
    <section className="centered-container">
      <table
        className="text-center"
        style={{
          height: '100%',
          margin: 'auto',
        }}
      >
        <tbody>
          <tr>
            <td className="align-middle">
              <h1 className="align-middle big-title">404</h1>
              <h2 className="align-middle">La página no se encuentra disponible</h2>
              <div className="separator"></div>
              <Link to="/">
                <button
                  className="btn btn-primary btn-lg"
                  style={{
                    backgroundColor: helpers.PALETTE.darkGreen,
                    borderColor: helpers.PALETTE.darkGreen,
                  }}
                >
                  Retornar a la página de inicio
                </button>
              </Link>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}

export default NotFound;

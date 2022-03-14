import React from 'react';
import ReactDOMServer from 'react-dom/server';
import $ from 'jquery';
import CryptoJS from 'crypto-js';

// React icons
import { AiOutlineUser } from 'react-icons/ai';
import { BiPurchaseTagAlt } from 'react-icons/bi';
import { FiBook } from 'react-icons/fi';

/**
 * Color palette
 */
const PALETTE = {
  white: '#fff',
  black: '#000',
  lightGray: '#eeeeee',
  darkGray: '#808080',
  gray: '#ccc',
  darkGreen: '#02353c',
  green: '#449342',
  lightGreen: '#2eaf7d',
  lightBlue: '#3fd0c9',
  lightestBlue: '#d1f6ed',
};

/**
 * Client pages
 */
const CLIENT_PAGES = [
  {
    icon: <FiBook />,
    title: 'Catálogo de dispositivos',
    reference: '/catalogo-dispositivos',
  },
  {
    icon: <BiPurchaseTagAlt />,
    title: 'Compras',
    reference: '/compras',
  },
  {
    icon: <AiOutlineUser />,
    title: 'Perfil',
    reference: '/perfil',
  },
];

/**
 * Get the copyright text with the current year.
 * @return {string}
 */
const getCopyrightText = () => {
  return `Copyright © ${new Date().getFullYear()}`;
};

/**
 * Get the web app authors.
 * @return {string}
 */
const getAuthors = () => {
  return 'Dylan Rodas y Gabriel Lemus';
};

/**
 * Return a string with the thousand separators.
 * @param {number} number
 * @return {string}
 */
const getThousandSeparators = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Determine if a string has an email format by regex.
 * @param {string} email The string to be evaluated.
 * @return {boolean} True if the string has an email format.
 */
const isValidEmail = (email) => {
  const regex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(email);
};

/**
 * Display a Bootstrap modal with a message.
 * @param {string} title The modal title.
 * @param {string} message The modal message.
 * @return {JSX.Element} The modal to be displayed.
 */
const getModal = (title, message) => {
  return (
    <div id="pageModal" className="modal" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <p>{message}</p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary close-btn"
              data-dismiss="modal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Add a modal to the DOM and display it.
 * @param {string} title The modal title.
 * @param {string} message The modal message.
 */
const showModal = (title, message) => {
  let modal = getModal(title, message);
  $('#pageModal').remove();
  $('body').append(ReactDOMServer.renderToString(modal));
  $('#pageModal').modal('show');
  $('#pageModal .close-btn').on('click', () => {
    $('#pageModal').modal('hide');
    $('#pageModal').remove();
    $('.modal-backdrop').remove();
  });
};

/**
 * Generate cryptographic salt.
 * @param {length} The length of the salt.
 * @return {string} The salt.
 */
const getCryptoSalt = (length) => {
  let result = '';
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Concatenate the password with the salt and hash them.
 * @param {string} password The password.
 * @param {string} salt The cryptographic salt.
 * @return {string} The hashed password.
 */
const getHashedPassword = (password, salt) => {
  // Use crypto-js
  return CryptoJS.SHA256(password + salt).toString();
};

/**
 * Display the formatted currency with the given sign.
 * @param {number} value The value to be displayed.
 * @param {string} sign The currency sign.
 * @return {string} The formatted currency.
 */
const getFormattedCurrency = (sign, value) => {
  return `${sign}${getThousandSeparators(value)}`;
};

/**
 * Localhost IP address.
 */
const LOCALHOST_IP = 'localhost';

/**
 * Tomcat port.
 */
const TOMCAT_PORT = '8080';

/**
 * General helpers
 */
const helpers = {
  PALETTE,
  CLIENT_PAGES,
  getCopyrightText,
  getAuthors,
  getThousandSeparators,
  isValidEmail,
  showModal,
  LOCALHOST_IP,
  TOMCAT_PORT,
  getCryptoSalt,
  getHashedPassword,
  getFormattedCurrency,
};

export default helpers;

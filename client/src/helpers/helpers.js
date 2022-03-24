import React from 'react';
import ReactDOMServer from 'react-dom/server';
import $ from 'jquery';
import CryptoJS from 'crypto-js';

// React icons
import { AiOutlineUser, AiOutlineShoppingCart } from 'react-icons/ai';
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
  blue: '#0583d2',
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
    icon: <AiOutlineShoppingCart />,
    title: 'Carrito de Compras',
    reference: '/carrito-compras',
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
 * Display a Bootstrap modal with a message.
 * @param {string} title The modal title.
 * @param {string} message The modal message.
 * @param {() => void} callback The callback to be executed when the modal is closed.
 * @return {JSX.Element} The modal to be displayed.
 */
const getOptionModal = (title, message, callback) => {
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
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary confirm-btn"
              data-dismiss="modal"
            >
              Aceptar
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
 * @param {() => void} callback The callback to be executed when the modal is closed.
 */
const showOptionModal = (title, message, callback) => {
  let modal = getOptionModal(title, message, callback);
  $('#pageModal').remove();
  $('body').append(ReactDOMServer.renderToString(modal));
  $('#pageModal').modal('show');
  $('#pageModal .close-btn').on('click', () => {
    $('#pageModal').modal('hide');
    $('#pageModal').remove();
    $('.modal-backdrop').remove();
    callback();
  });
  $('.confirm-btn').on('click', () => {
    callback();
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
  let formattedCurrency = `${sign}${value
    .toFixed(2)
    .replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;

  return formattedCurrency;
};

/**
 * Compare if two objects have the same keys and values.
 * @param {object} obj1 The first object.
 * @param {object} obj2 The second object.
 * @return {boolean} True if the objects have the same keys and values.
 */
const compareObjects = (obj1, obj2) => {
  let keys1 = Object.keys(obj1);
  let keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let i = 0; i < keys1.length; i++) {
    if (obj1[keys1[i]] !== obj2[keys1[i]] || keys1[i] !== keys2[i]) {
      return false;
    }
  }

  return true;
};

/**
 * Get the base64 representation of a file.
 * @param {File} file The file to be converted.
 * @return {Promise<string>} The base64 representation of the file.
 */
const getBase64 = (file) => {
  let reader = new FileReader();
  reader.readAsDataURL(file);

  return new Promise((resolve, reject) => {
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
};

/**
 * Replace white spaces with the given character.
 * @param {string} str The string to be replaced.
 * @param {string} char The character to be used.
 * @return {string} The string with the replaced white spaces.
 */
const replaceWhiteSpaces = (str, char) => {
  return str.replace(/\s/g, char);
};

/**
 * Set user attributes to the local storage.
 * @param {string} userType The user type.
 * @param {Number} userId The user id.
 */
const setLoginUserAttributes = (userType, userId, userName) => {
  localStorage.setItem('loggedIn', true);
  localStorage.setItem('userType', userType);
  localStorage.setItem('userId', userId);
  localStorage.setItem('userName', userName);
};

/**
 * Remove user attributes from the local storage.
 */
const removeLoginUserAttributes = () => {
  localStorage.clear();
};

/**
 * Check if the user is logged in based on the local storage.
 * @return {boolean} True if the user is logged in.
 */
const isLoggedIn = () => {
  return localStorage.getItem('loggedIn') === 'true';
};

/**
 * Check if the password is valid based on the salt and the hashed password.
 * @param {string} password The password.
 * @param {string} salt The cryptographic salt.
 * @param {string} hashedPassword The hashed password.
 * @return {boolean} True if the password is valid.
 */
const isValidPassword = (password, salt, hashedPassword) => {
  return getHashedPassword(password, salt) === hashedPassword;
};

/**
 * Check if the string provided is a valid card expiration date (MM/YY).
 * @param {string} date The date to be checked.
 * @return {boolean} True if the date is valid.
 */
const isValidCardExpirationDate = (date) => {
  let regex = /^(0[1-9]|1[0-2])\/[0-9]{2}$/;
  return regex.test(date);
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
  showOptionModal,
  LOCALHOST_IP,
  TOMCAT_PORT,
  getCryptoSalt,
  getHashedPassword,
  getFormattedCurrency,
  compareObjects,
  getBase64,
  replaceWhiteSpaces,
  setLoginUserAttributes,
  removeLoginUserAttributes,
  isLoggedIn,
  isValidPassword,
  isValidCardExpirationDate,
};

export default helpers;

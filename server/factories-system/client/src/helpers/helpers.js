import React from 'react';
import ReactDOMServer from 'react-dom/server';
import $ from 'jquery';
import CryptoJS from 'crypto-js';

// React icons
import { FiBook, FiUsers } from 'react-icons/fi';
import { RiCheckboxMultipleLine } from 'react-icons/ri';
import { HiOutlineClipboardCheck } from 'react-icons/hi';
import { AiOutlineCheckSquare, AiOutlineUser } from 'react-icons/ai';
import { BiPurchaseTagAlt } from 'react-icons/bi';

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
  darkBlue: '#16558f',
  blue: '#0583d2',
  lightBlue: '#8cd3ff',
  lightestBlue: '#bfe6ff',
};

/**
 * Factory pages
 */
const FACTORY_PAGES = [
  {
    icon: <FiBook />,
    title: 'Catálogo de ventas',
    reference: '/catalogo-ventas',
  },
  {
    icon: <FiUsers />,
    title: 'Clientes',
    reference: '/clientes',
  },
  {
    icon: <HiOutlineClipboardCheck />,
    title: 'Gestión de órdenes',
    reference: '/ordenes-fabricas',
  },
  {
    icon: <AiOutlineUser />,
    title: 'Perfil',
    reference: '/perfil',
  },
];

/**
 * Seller pages
 */
const SELLER_PAGES = [
  {
    icon: <FiBook />,
    title: 'Catálogo de dispositivos',
    reference: '/catalogo-dispositivos',
  },
  {
    icon: <RiCheckboxMultipleLine />,
    title: 'Órdenes',
    reference: '/ordenes',
  },
  {
    icon: <HiOutlineClipboardCheck />,
    title: 'Gestión de órdenes',
    reference: '/gestion-ordenes',
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
 * Determine if two arrays of objects have the same keys and values.
 * @param {object[]} arr1 The first array of objects.
 * @param {object[]} arr2 The second array of objects.
 * @return {boolean} True if the arrays have the same keys and values.
 */
const compareArrays = (arr1, arr2) => {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (!compareObjects(arr1[i], arr2[i])) {
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
 * Get the name of the day of the week based on the date.
 * @param {Date} date The date to be checked.
 * @return {string} The name of the day of the week.
 */
const getDayOfWeek = (date) => {
  const days = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sabado',
  ];

  return days[date.getDay()];
};

/**
 * Format date and time from YYYY-MM-DD HH:mm:ss to day of the week, date de month del year a las HH:mm. a.m./p.m.
 * @param {string} date The date to be formatted.
 * @return {string} The formatted date.
 */
const formatDate = (date) => {
  let formattedDate = '';

  if (date) {
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    let dateObj = new Date(date);
    let dayOfWeek = getDayOfWeek(dateObj);
    let day =
      dateObj.getDate() < 10 ? `0${dateObj.getDate()}` : dateObj.getDate();
    let month = months[dateObj.getMonth()];
    let year = dateObj.getFullYear();
    let hours =
      dateObj.getHours() < 10
        ? `0${dateObj.getHours()}`
        : dateObj.getHours() % 12;
    let minutes =
      dateObj.getMinutes() < 10
        ? `0${dateObj.getMinutes()}`
        : dateObj.getMinutes();
    let ampm = dateObj.getHours() >= 12 ? 'p.m.' : 'a.m.';

    formattedDate = `${dayOfWeek}, ${day} de ${month} del ${year} a las ${hours}:${minutes} ${ampm}`;
  }

  return formattedDate;
};

/**
 * Format date and time from YYYY-MM-DD HH:mm:ss to day of the week, date de month del year
 * @param {string} date The date to be formatted.
 * @return {string} The formatted date.
 */
const formatDate2 = (date) => {
  let formattedDate = '';

  if (date) {
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    let dateObj = new Date(date);
    let dayOfWeek = getDayOfWeek(dateObj);
    let day =
      dateObj.getDate() < 10 ? `0${dateObj.getDate()}` : dateObj.getDate();
    let month = months[dateObj.getMonth()];
    let year = dateObj.getFullYear();

    formattedDate = `${dayOfWeek}, ${day} de ${month} del ${year}`;
  }

  return formattedDate;
};

/**
 * Iterate through an array of objects and check if a given value is present in an object.
 * @param {object[]} arr The array of objects.
 * @param {string} key The key to be checked.
 * @param {string} value The value to be checked.
 * @return {boolean} True if the value is present in the object.
 */
const isValueInArray = (arr, key, value) => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === value) {
      return true;
    }
  }

  return false;
};

/**
 * Get the index of an object inside an array of objects.
 * @param {object[]} arr The array of objects.
 * @param {string} key The key to be checked.
 * @param {string} value The value to be checked.
 * @return {number} The index of the object. -1 if the object is not found.
 */
const getIndexOfObject = (arr, key, value) => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === value) {
      return i;
    }
  }

  return -1;
};

/**
 * Get the difference in days between a date in the future and today
 * @param {string} date The date to be checked.
 * @return {number} The difference in days.
 */
const getDifferenceInDays = (date) => {
  let today = new Date();
  let future = new Date(date);
  let difference = Math.abs(future - today);
  let differenceInDays = Math.ceil(difference / (1000 * 3600 * 24));

  return differenceInDays;
};

/**
 * Get the factory pages array from the factory pages object and add the sales report page given the user id.
 * @param {String} userId The user id.
 * @return {Array} The factory pages array.
 */
const getFactoryPages = (userId) => {
  let salesReportPage = {
    icon: <BiPurchaseTagAlt />,
    title: 'Ventas',
    reference: `/reportes-ventas/${userId}`,
  };

  // Insert the sales report page as the second-to-last page in the array.
  let factoryPages = JSON.parse(JSON.stringify(FACTORY_PAGES));
  factoryPages.splice(factoryPages.length - 1, 0, salesReportPage);

  return factoryPages;
};

/**
 * Get the icon based on the page name.
 * @param {string} pageName The page name.
 * @return {React.Component} The icon component.
 */
const getIcon = (pageName) => {
  switch (pageName) {
    case 'Catálogo de ventas':
      return <FiBook />;

    case 'Clientes':
      return <FiUsers />;

    case 'Gestión de órdenes':
      return <HiOutlineClipboardCheck />;

    case 'Órdenes entregadas':
      return <AiOutlineCheckSquare />;

    case 'Perfil':
      return <AiOutlineUser />;

    case 'Ventas':
      return <BiPurchaseTagAlt />;

    default:
      return <FiBook />;
  }
};

/**
 * General helpers
 */
const helpers = {
  PALETTE,
  FACTORY_PAGES,
  SELLER_PAGES,
  getCopyrightText,
  getAuthors,
  getThousandSeparators,
  isValidEmail,
  showModal,
  showOptionModal,
  getCryptoSalt,
  getHashedPassword,
  getFormattedCurrency,
  compareObjects,
  compareArrays,
  getBase64,
  replaceWhiteSpaces,
  setLoginUserAttributes,
  removeLoginUserAttributes,
  isLoggedIn,
  isValidPassword,
  isValidCardExpirationDate,
  formatDate,
  formatDate2,
  isValueInArray,
  getIndexOfObject,
  getDifferenceInDays,
  getFactoryPages,
  getIcon,
};

export default helpers;


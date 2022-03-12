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
 * @param {string} email
 * @return {boolean} True if the string has an email format.
 */
const isValidEmail = (email) => {
  const regex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(email);
};

/**
 * General helpers
 */
const helpers = {
  PALETTE,
  getCopyrightText,
  getAuthors,
  getThousandSeparators,
  isValidEmail,
};

export default helpers;

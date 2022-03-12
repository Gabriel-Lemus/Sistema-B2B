/**
 * Function to get the copyright text with the current year.
 * @return {string}
 */
const getCopyrightText = () => {
  return `Copyright © ${new Date().getFullYear()}`;
};

/**
 * Function to get the web app authors.
 * @return {string}
 */
const getAuthors = () => {
  return 'Dylan Rodas y Gabriel Lemus';
};

/**
 * Function that receives a number and returns a string with the thousand separators.
 * @param {number} number
 * @return {string}
 */
const getThousandSeparators = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

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
 * General helpers
 */
const helpers = {
  PALETTE,
  getCopyrightText,
  getAuthors,
  getThousandSeparators,
};

export default helpers;

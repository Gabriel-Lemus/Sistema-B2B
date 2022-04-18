import React from 'react';
import helpers from '../../helpers/helpers';

function TextInput(props) {
  return (
    <>
      <label htmlFor={`${props.label}Input`} className="text-input-label">
        {props.placeholder}
      </label>
      <input
        type="text"
        id={`${props.label}Input`}
        className="form-control text-input"
        placeholder={props.placeholder}
        required={props.required}
        onInvalid={(e) => {
          e.target.setCustomValidity(
            `Por favor, ingrese su ${props.placeholder.toLowerCase()}`
          );
        }}
        onChange={(e) => {
          props.onChange(e.target.value);
        }}
        style={{
          backgroundColor: helpers.PALETTE.lightGray,
        }}
      />
    </>
  );
}

export default TextInput;

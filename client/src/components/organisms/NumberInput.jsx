import React from 'react';
import helpers from '../../helpers/helpers';

function NumberInput(props) {
  return (
    <>
      <label htmlFor={`${props.label}Input`} className="text-input-label">
        {props.placeholder}
      </label>
      <input
        type="number"
        id={`${props.label}Input`}
        className="form-control text-input"
        placeholder={props.placeholder}
        required={props.required}
        min={props.min}
        max={props.max}
        onInvalid={(e) => {
          e.target.setCustomValidity(
            `Por favor, ingrese su ${props.placeholder.toLowerCase()}`
          );
        }}
        onChange={(e) => {
          if (props.maxLength !== undefined) {
            if (e.target.value.length > props.maxLength) {
              e.target.value = e.target.value.slice(0, props.maxLength);
              props.onChange(e.target.value.slice(0, props.maxLength));
            }
          } else {
            props.onChange(e.target.value);
          }
        }}
        style={{
          backgroundColor: helpers.PALETTE.lightGray,
        }}
      />
    </>
  );
}

export default NumberInput;

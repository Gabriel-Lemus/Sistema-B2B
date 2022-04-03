import React from 'react';

function IndividualTextInput(props) {
  return (
    <input
      type={props.type}
      id={`${props.label}Input`}
      className="form-control text-input"
      placeholder={props.placeholder}
      required={props.required}
      value={props.value}
      onInvalid={(e) => {
        e.target.setCustomValidity(
          `Por favor, ingrese su ${props.placeholder.toLowerCase()}`
        );
      }}
      onChange={(e) => {
        props.onChangeCallback(e);
      }}
    />
  );
}

export default IndividualTextInput;

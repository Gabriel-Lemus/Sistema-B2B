import React from 'react';

function TextCenter(props) {
  return <p className="text-center centered-paragraph">
    {props.children}
  </p>;
}

export default TextCenter;

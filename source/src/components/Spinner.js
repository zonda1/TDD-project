import React from "react";

const Spinner = (props) => {
  let spinnerClassname = `spinner-border`;

  if (props.size !== "big") {
    spinnerClassname += " spinner-border-sm";
  }

  return <span className={spinnerClassname} role="status" />;
};

export default Spinner;

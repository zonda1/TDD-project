import React from "react";
import Spinner from "./Spinner";

const ButtonWithProgress = (props) => {
  const { disabled, apiCallInProgress, onClick } = props;
  return (
    <button
      className="btn btn-primary"
      disabled={disabled || apiCallInProgress}
      onClick={onClick}
    >
      {apiCallInProgress && <Spinner />}
      {props.children}
    </button>
  );
};

export default ButtonWithProgress;

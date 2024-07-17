import React from "react";

const Alert = (props) => {
  let alertClassname = `alert alert-${props.type}`;
  if (props.center) {
    alertClassname+=' text-center'
  }
 
  return (
    <div className={alertClassname} role="alert">
      {props.children}
    </div>
  );
};

Alert.defaultProps={
    type:'success'
}

export default Alert;

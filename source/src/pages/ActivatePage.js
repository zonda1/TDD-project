import React, { useEffect, useState } from "react";
import { activate } from "../api/apiCalls";
import Spinner from "../components/Spinner";
import Alert from "../components/Alert";

const ActivatePage = (props) => {
  const [res, setRes] = useState();

  useEffect(() => {
    async function activateRequest() {
      setRes();
      try {
        await activate(props.match.params.token);
        setRes("success");
      } catch (error) {
        setRes("fail");
      }
    }
    activateRequest();
  }, [props.match.params.token]);

  let content = (
    <Alert type="secondary" center>
      <Spinner size="big" />
    </Alert>
  );

  if (res === "success") {
    content = <Alert>Activation success</Alert>;
  }

  if (res === "fail") {
    content = <Alert type="danger"> Activation fail</Alert>;
  }

  return (
    <div data-testid="activate-page">
      <h1>Account Activation Page</h1>
      {content}
    </div>
  );
};

export default ActivatePage;

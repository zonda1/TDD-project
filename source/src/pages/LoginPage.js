import React, { useEffect, useState } from "react";
import Input from "../components/Input";
import { login } from "../api/apiCalls";
import Spinner from "../components/Spinner";
import Alert from "../components/Alert";
import ButtonWithProgress from "../components/ButtonWithProgress";

const LoginPage = (props) => {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [apiCallInProgress, setApiCallInProgress] = useState(false);
  const [failMessage, setFailMessage] = useState();

  useEffect(() => {
    setFailMessage();
  }, [email, password]);

  const submit = async (e) => {
    e.preventDefault();
    setApiCallInProgress(true);

    try {
      const res = await login({ email, password });
      props.history.push("/");
      const auth = {
        loggedIn: true,
        id: res.data.id,
      };

      props.onSuccessLogin(auth);
    } catch (error) {
      setFailMessage(error.response.data.message);
    }
    setApiCallInProgress(false);
  };

  let disabled = !(email && password);

  return (
    <div
      data-testid="login-page"
      className="col-xl-6 offset-xl-3 col-md-8 offset-md-2"
    >
      <form className="card" data-testid="form">
        <div className="card-header text-center">
          <h1>Login</h1>
        </div>

        <div className="card-body">
          <Input
            id={"email"}
            label={"E-mail"}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            id={"password"}
            label="Password"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          {failMessage && <Alert type="danger">{failMessage}</Alert>}

          <div className="text-center">
            <ButtonWithProgress
              disabled={disabled}
              apiCallInProgress={apiCallInProgress}
              onClick={submit}
            >
              Login
            </ButtonWithProgress>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;

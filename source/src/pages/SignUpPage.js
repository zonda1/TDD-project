import React from "react";
import Input from "../components/Input";
import { withTranslation } from "react-i18next";
import { signUp } from "../api/apiCalls";
import Spinner from "../components/Spinner";
import Alert from "../components/Alert";
import withHover from "../withHover";
import ButtonWithProgress from "../components/ButtonWithProgress";

class SignUpPage extends React.Component {
  state = {
    username: "",
    email: "",
    password: "",
    passwordRepeat: "",
    onProgressApiRequest: false,
    successApiRequest: false,
    errors: {},
  };

  onChangeFormValueHandler = (e) => {
    const { id, value } = e.target;

    const errorsCopy = { ...this.state.errors };
    delete errorsCopy[id];

    this.setState({
      [id]: value,
      errors: errorsCopy,
    });
  };

  submit = async () => {
    const { username, email, password } = this.state;
    const body = { username, email, password };

    this.setState({ onProgressApiRequest: true });

    try {
      await signUp(body);
      this.setState({ successApiRequest: true });
    } catch (error) {
      if (error.response.status === 400) {
        this.setState({ errors: error.response.data.validationErrors });
      }
      this.setState({ onProgressApiRequest: false });
    }
  };

  render() {
    const { t } = this.props;

    let disabled = true;
    const {
      password,
      passwordRepeat,
      onProgressApiRequest,
      successApiRequest,
      errors,
    } = this.state;

    if (password && passwordRepeat) {
      disabled = password !== passwordRepeat;
    }

    const passwordMismatch =
      password !== passwordRepeat ? t("passwordMismatch") : "";

    return (
      <div
        data-testid="signup-page"
        className="col-xl-6 offset-xl-3 col-md-8 offset-md-2"
      >
        {!successApiRequest && (
          <form className="card" data-testid="form">
            <div className="card-header text-center">
              <h1>{t("signUp")}</h1>
            </div>

            <div className="card-body">
              <Input
                id={"username"}
                label={t("username")}
                onChange={this.onChangeFormValueHandler}
                help={errors.username}
              />
              <Input
                id={"email"}
                label={t("email")}
                onChange={this.onChangeFormValueHandler}
                help={errors.email}
              />
              <Input
                id={"password"}
                label={t("password")}
                onChange={this.onChangeFormValueHandler}
                help={errors.password}
                type="password"
              />
              <Input
                id={"passwordRepeat"}
                label={t("passwordRepeat")}
                onChange={this.onChangeFormValueHandler}
                help={passwordMismatch}
                type="password"
              />

              <div className="text-center">
                <ButtonWithProgress
                  disabled={disabled}
                  apiCallInProgress={onProgressApiRequest}
                  onClick={this.submit}
                >
                  {t("signUp")}
                </ButtonWithProgress>
              </div>
            </div>
          </form>
        )}
        {successApiRequest && (
          <Alert> Check your e-mail to confirm registration</Alert>
        )}
      </div>
    );
  }
}

const SignUpPageWithTranslation = withTranslation()(SignUpPage);

export default SignUpPageWithTranslation;

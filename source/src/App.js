import "./App.css";
import SignUpPage from "./pages/SignUpPage";
import "./locale/i18n.js";
import LanguageSelector from "./components/LanguageSelector.js";
import HomePage from "./pages/HomePage.js";
import UserPage from "./pages/UserPage.js";
import LoginPage from "./pages/LoginPage.js";
import { useTranslation } from "react-i18next";
import logo from "./assets/23082612-hoaxify.png";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import ActivatePage from "./pages/ActivatePage.js";
import { useState } from "react";

function App() {
  const { t } = useTranslation();
  const [auth, setAuth] = useState({
    loggedIn: false,
    id: "",
  });

  return (
    <Router>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container">
          <Link className="navbar-brand" to="/" title="Home">
            <img src={logo} width={60} alt="Homelink-image" />
            Hoaxify
          </Link>
          <ul className="navbar-nav">
            {!auth.loggedIn && (
              <>
                <Link className="nav-link" to="/signup">
                  {t("signUp")}
                </Link>
                <Link className="nav-link" to="/login">
                  Login
                </Link>
              </>
            )}

            {auth.loggedIn && (
              <Link className="nav-link" to={`/user/${auth.id}`}>
                My Profile
              </Link>
            )}
            {/* <Link className="nav-link" to="/activate/1">
              Activate 1
            </Link>
            <Link className="nav-link" to="/activate/2">
            Activate 2
            </Link> */}
          </ul>
        </div>
      </nav>
      <div className="container pt-3">
        <Route path="/" exact component={HomePage} />
        <Route path="/signup" component={SignUpPage} />
        <Route
          path="/login"
          render={(withRouterProps) => {
            return <LoginPage {...withRouterProps} onSuccessLogin={setAuth} />;
          }}
        />
        <Route path="/user/:id" component={UserPage} />
        <Route path="/activate/:token" component={ActivatePage} />

        <LanguageSelector text={"this is text prop"} />
      </div>
    </Router>
  );
}

export default App;

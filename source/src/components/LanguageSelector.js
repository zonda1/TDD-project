import React from "react";
import { useTranslation } from "react-i18next";
import withHover from "../withHover";

const LanguageSelector = (props) => {
  const { i18n } = useTranslation();

  let size = 24;
  if (props.on) {
    size = 48;
  }

  return (
    <>
      <img
        src={`https://flagsapi.com/RU/flat/${size}.png`}
        title="Rus"
        onClick={() => i18n.changeLanguage("ru")}
        alt="Russian flag"
      />
      <img
        src={`https://flagsapi.com/GB/flat/${size}.png`}
        title="En"
        onClick={() => i18n.changeLanguage("en")}
        alt="English flag"
      />
    </>
  );
};

export default withHover(LanguageSelector);

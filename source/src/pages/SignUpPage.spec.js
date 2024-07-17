import {
  act,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignUpPage from "./SignUpPage";
import { setupServer } from "msw/node";
import { rest } from "msw";
import en from "../locale/en.json";
import ru from "../locale/ru.json";
import i18n from "../locale/i18n";
import LanguageSelector from "../components/LanguageSelector";

let requestBody, acceptLanguageHeader;
let counter = 0;
const server = setupServer(
  rest.post("/api/1.0/users", (req, res, ctx) => {
    requestBody = req.body;
    acceptLanguageHeader = req.headers.get("Accept-Language");
    counter += 1;
    return res(ctx.status(200));
  })
);

beforeEach(() => {
  counter = 0;
  server.resetHandlers();
});
beforeAll(() => server.listen());
afterAll(() => server.close());

describe("SignUpPage", () => {
  describe("Layout", () => {
    it("has header", () => {
      render(<SignUpPage />);
      const header = screen.queryByRole("heading", { name: "Sign Up" });
      expect(header).toBeInTheDocument();
    });

    it("has username input", () => {
      render(<SignUpPage />);
      const input = screen.getByLabelText("Username");
      expect(input).toBeInTheDocument();
    });
    it("has email input", () => {
      render(<SignUpPage />);
      const input = screen.getByLabelText("E-mail");
      expect(input).toBeInTheDocument();
    });
    it("has password input", () => {
      render(<SignUpPage />);
      const input = screen.getByLabelText("Password");
      expect(input).toBeInTheDocument();
    });
    it("has password type in password input", () => {
      render(<SignUpPage />);
      const input = screen.getByLabelText("Password");
      expect(input.type).toBe("password");
    });
    it("has password repeat input", () => {
      render(<SignUpPage />);
      const input = screen.getByLabelText("Repeat Password");
      expect(input).toBeInTheDocument();
    });
    it("has password type in password repeat input", () => {
      render(<SignUpPage />);
      const input = screen.getByLabelText("Repeat Password");
      expect(input.type).toBe("password");
    });

    it("has submit button", () => {
      render(<SignUpPage />);
      const button = screen.queryByRole("button", { name: "Sign Up" });
      expect(button).toBeInTheDocument();
    });
    it("has submit button disabled", () => {
      render(<SignUpPage />);
      const button = screen.queryByRole("button", { name: "Sign Up" });
      expect(button).toBeDisabled();
    });
  });

  describe("Interaction", () => {
    let button, userInput, emailInput, passwordInput, passwordRepeatInput;

    const setup = () => {
      render(<SignUpPage />);
      userInput = screen.getByLabelText("Username");
      emailInput = screen.getByLabelText("E-mail");
      passwordInput = screen.getByLabelText("Password");
      passwordRepeatInput = screen.getByLabelText("Repeat Password");
      userEvent.type(userInput, "user1");
      userEvent.type(emailInput, "user1@mail.ru");
      userEvent.type(passwordInput, "qwerty");
      userEvent.type(passwordRepeatInput, "qwerty");
      button = screen.queryByRole("button", { name: "Sign Up" });
    };

    it("activates submit button if password input value equals password repeat input value", () => {
      setup();
      expect(button).not.toBeDisabled();
    });

    it("sends data to server", async () => {
      setup();

      userEvent.click(button);

      const message = "Check your e-mail to confirm registration";
      await screen.findByText(message);

      expect(requestBody).toEqual({
        username: "user1",
        email: "user1@mail.ru",
        password: "qwerty",
      });
    });

    it("disables button  when there is an ongoing api request", async () => {
      setup();

      userEvent.click(button);
      userEvent.click(button);

      const message = "Check your e-mail to confirm registration";
      await screen.findByText(message);

      expect(counter).toBe(1);
    });

    it("dispays spinner after clicking the button", async () => {
      setup();

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      userEvent.click(button);

      const spinner = screen.getByRole("status");
      expect(spinner).toBeInTheDocument();
      const message = "Check your e-mail to confirm registration";
      await screen.findByText(message);
    });

    it("displays notification after success sign up request", async () => {
      setup();

      const message = "Check your e-mail to confirm registration";
      expect(screen.queryByText(message)).not.toBeInTheDocument();
      userEvent.click(button);
      const notify = await screen.findByText(message);
      expect(notify).toBeInTheDocument();
    });

    it("hide form after success sign up request", async () => {
      setup();

      expect(screen.queryByTestId("form")).toBeInTheDocument();
      userEvent.click(button);
      await waitFor(() =>
        expect(screen.queryByTestId("form")).not.toBeInTheDocument()
      );
    });

    // VALIDATION

    const generateValidationError = (field, message) => {
      return rest.post("/api/1.0/users", (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({
            validationErrors: {
              [field]: message,
            },
          })
        );
      });
    };

    it.each`
      field         | message
      ${"username"} | ${"Username cannot be null"}
      ${"email"}    | ${"E-mail cannot be null"}
      ${"password"} | ${"Password cannot be null"}
    `(
      "displays validation message: $message for $field field",
      async ({ field, message }) => {
        server.use(generateValidationError(field, message));
        setup();
        userEvent.click(button);

        const userNameError = await screen.findByText(message);
        expect(userNameError).toBeInTheDocument();
      }
    );

    it("hides spinner and enables button after server response", async () => {
      server.use(
        generateValidationError("username", "Username cannot be null")
      );
      setup();
      userEvent.click(button);

      await screen.findByText("Username cannot be null");
      const spinner = screen.queryByRole("status");
      expect(spinner).not.toBeInTheDocument();
      expect(button).toBeEnabled();
    });

    it("displays mismatch message below password repeat input", () => {
      setup();
      userEvent.type(passwordInput, "qwerty");
      userEvent.type(passwordRepeatInput, "qwertyAnother");
      const validationError = screen.queryByText("Password mismatch");
      expect(validationError).toBeInTheDocument();
    });

    it.each`
      field         | message                      | label
      ${"username"} | ${"Username cannot be null"} | ${"Username"}
      ${"email"}    | ${"E-mail cannot be null"}   | ${"E-mail"}
      ${"password"} | ${"Password cannot be null"} | ${"Password"}
    `(
      "close $field validation error after field updating",
      async ({ field, message, label }) => {
        server.use(generateValidationError(field, message));
        setup();
        userEvent.click(button);

        await screen.findByText(message);

        userEvent.type(screen.queryByLabelText(label), "update");
        const validationError = screen.queryByText(message);
        expect(validationError).not.toBeInTheDocument();
      }
    );
  });

  describe("Internalization", () => {
    let passwordInput, passwordRepeatInput, russianToggle, englishToggle;

    const setup = () => {
      render(
        <>
          <SignUpPage />
          <LanguageSelector />
        </>
      );
      passwordInput = screen.getByLabelText("Password");
      passwordRepeatInput = screen.getByLabelText("Repeat Password");
      russianToggle = screen.getByTitle("Rus");
      englishToggle = screen.getByTitle("En");
    };

    it("initial page has all text titles in russian after switching from english", () => {
      setup();
      userEvent.click(russianToggle);
      expect(
        screen.queryByRole("heading", { name: ru.signUp })
      ).toBeInTheDocument();
      expect(screen.queryByLabelText(ru.username)).toBeInTheDocument();
      expect(screen.queryByLabelText(ru.email)).toBeInTheDocument();
      expect(screen.queryByLabelText(ru.password)).toBeInTheDocument();
      expect(screen.queryByLabelText(ru.passwordRepeat)).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: ru.signUp })
      ).toBeInTheDocument();
    });

    it("initial page has all text titles in english", () => {
      setup();

      expect(
        screen.queryByRole("heading", { name: en.signUp })
      ).toBeInTheDocument();
      expect(screen.queryByLabelText(en.username)).toBeInTheDocument();
      expect(screen.queryByLabelText(en.email)).toBeInTheDocument();
      expect(screen.queryByLabelText(en.password)).toBeInTheDocument();
      expect(screen.queryByLabelText(en.passwordRepeat)).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: en.signUp })
      ).toBeInTheDocument();
    });

    it("initial page has all text titles in english after switching from russian", () => {
      setup();
      userEvent.click(russianToggle);
      userEvent.click(englishToggle);
      expect(
        screen.queryByRole("heading", { name: en.signUp })
      ).toBeInTheDocument();
      expect(screen.queryByLabelText(en.username)).toBeInTheDocument();
      expect(screen.queryByLabelText(en.email)).toBeInTheDocument();
      expect(screen.queryByLabelText(en.password)).toBeInTheDocument();
      expect(screen.queryByLabelText(en.passwordRepeat)).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: en.signUp })
      ).toBeInTheDocument();
    });
    it("displays password mismatch text in Russian", () => {
      setup();
      userEvent.type(passwordInput, "qwerty");
      userEvent.type(passwordRepeatInput, "qwertyAnother");
      userEvent.click(screen.getByTitle("Rus"));
      const validationErrorOnRussain = screen.queryByText(ru.passwordMismatch);
      expect(validationErrorOnRussain).toBeInTheDocument();
    });

    it("sends accept language header as english for outgoing request", async () => {
      setup();

      userEvent.type(passwordInput, "Qwert5");
      userEvent.type(passwordRepeatInput, "Qwert5");
      userEvent.click(screen.queryByRole("button", { name: en.signUp }));
      const form = screen.queryByTestId("form");
      await waitForElementToBeRemoved(form);
      expect(acceptLanguageHeader).toBe("en");
    });
    it("sends accept language header as russian for outgoing request after switching language", async () => {
      setup();

      userEvent.type(passwordInput, "Qwert5");
      userEvent.type(passwordRepeatInput, "Qwert5");
      userEvent.click(russianToggle);
      userEvent.click(screen.queryByRole("button", { name: ru.signUp }));
      const form = screen.queryByTestId("form");
      await waitForElementToBeRemoved(form);
      expect(acceptLanguageHeader).toBe("ru");
    });
  });
});

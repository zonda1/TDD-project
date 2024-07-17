import {
  screen,
  render,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import LoginPage from "./LoginPage";
import userEvent from "@testing-library/user-event";

import { setupServer } from "msw/node";
import { rest } from "msw";

let reqBody,
  count = 0;

const server = setupServer(
  rest.post("/api/1.0/auth", (req, res, ctx) => {
    reqBody = req.body;
    count += 1;
    return res(ctx.status(401), ctx.body({ message: "Incorrect credentials" }));
  })
);

beforeEach(() => {
  count = 0;
  server.resetHandlers();
});
beforeAll(() => server.listen());
afterAll(() => server.close());

describe("Login Page", () => {
  describe("Layout", () => {
    it("has header", () => {
      render(<LoginPage />);
      const header = screen.queryByRole("heading", { name: "Login" });
      expect(header).toBeInTheDocument();
    });

    it("has email input", () => {
      render(<LoginPage />);
      const input = screen.getByLabelText("E-mail");
      expect(input).toBeInTheDocument();
    });
    it("has password input", () => {
      render(<LoginPage />);
      const input = screen.getByLabelText("Password");
      expect(input).toBeInTheDocument();
    });
    it("has password type in password input", () => {
      render(<LoginPage />);
      const input = screen.getByLabelText("Password");
      expect(input.type).toBe("password");
    });

    it("has submit button", () => {
      render(<LoginPage />);
      const button = screen.queryByRole("button", { name: "Login" });
      expect(button).toBeInTheDocument();
    });
    it("has submit button disabled", () => {
      render(<LoginPage />);
      const button = screen.queryByRole("button", { name: "Login" });
      expect(button).toBeDisabled();
    });
  });

  describe("Interactions", () => {
    let button, emailInput, passwordInput;
    const setup = () => {
      render(<LoginPage />);
      emailInput = screen.queryByLabelText("E-mail");
      passwordInput = screen.queryByLabelText("Password");
      userEvent.type(emailInput, "user100@mail.ru");
      userEvent.type(passwordInput, "Qwert5");
      button = screen.queryByRole("button", { name: "Login" });
    };

    it("enables login button when inputs are filled", () => {
      setup();
      expect(button).toBeEnabled();
    });

    it("displays spnner during api call in progress", async () => {
      setup();
      let spinner = screen.queryByRole("status");
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      userEvent.click(button);
      spinner = screen.getByRole("status");

      await waitForElementToBeRemoved(spinner);
    });

    it("disables login button after api call is sent", async () => {
      setup();
      userEvent.click(button);
      userEvent.click(button);
      const spinner = screen.getByRole("status");

      await waitForElementToBeRemoved(spinner);
      expect(count).toBe(1);
    });

    it("send email and password to backend in api call", async () => {
      setup();
      userEvent.click(button);
      const spinner = screen.getByRole("status");

      await waitForElementToBeRemoved(spinner);
      expect(reqBody).toEqual({
        email: "user100@mail.ru",
        password: "Qwert5",
      });
    });
    it("displays auth fail message", async () => {
      setup();
      userEvent.click(button);
      const failMessage = await screen.findByText("Incorrect credentials");
      expect(failMessage).toBeInTheDocument();
    });
    it("hide auth fail message after email field changed", async () => {
      setup();
      userEvent.click(button);
      await screen.findByText("Incorrect credentials");
      userEvent.type(emailInput, "new@mail.com");
      expect(
        screen.queryByText("Incorrect credentials")
      ).not.toBeInTheDocument();
    });
    it("hide auth fail message after password field changed", async () => {
      setup();
      userEvent.click(button);
      await screen.findByText("Incorrect credentials");
      userEvent.type(passwordInput, "newQwert5");
      expect(
        screen.queryByText("Incorrect credentials")
      ).not.toBeInTheDocument();
    });
  });


  describe('Internalization',()=>{
    // не стал делать
  })
});

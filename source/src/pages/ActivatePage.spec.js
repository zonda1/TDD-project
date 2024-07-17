import { render, screen } from "@testing-library/react";
import ActivatePage from "./ActivatePage";
import { setupServer } from "msw/node";
import { rest } from "msw";

let counter = 0;
const server = setupServer(
  rest.post("/api/1.0/users/token/:token", (req, res, ctx) => {
    counter += 1;
    if (req.params.token === "4567") {
      return res(ctx.status(400));
    }
    return res(ctx.status(200));
  })
);

beforeEach(() => {
  counter = 0;
  server.resetHandlers();
});
beforeAll(() => server.listen());
afterAll(() => server.close());

describe("ActivaPage component sending API request", () => {
  const setup = (token) => {
    const match = { params: { token } };
    render(<ActivatePage match={match} />);
  };
  it("displays success message when token is valid", async () => {
    setup("1234");
    const message = await screen.findByText("Activation success");
    expect(message).toBeInTheDocument();
  });
  it("sends activation request to backend", async () => {
    setup("1234");
    await screen.findByText("Activation success");
    expect(counter).toBe(1);
  });

  it("displays fail message when token is invalid", async () => {
    setup("4567");
    const message = await screen.findByText("Activation fail");
    expect(message).toBeInTheDocument();
  });

  it("sends authorization request when token is changed", async () => {
    const match = { params: { token: "1234" } };
    const { rerender } = render(<ActivatePage match={match} />);
    await screen.findByText("Activation success");
    match.params.token = "4567";
    rerender(<ActivatePage match={match} />);

    await screen.findByText("Activation fail");
    expect(counter).toBe(2);
  });

  it("displays spinner while autorization request processing", async () => {
    setup("1234");
    const spinner = screen.getByRole("status");

    await screen.findByText("Activation success");
    expect(spinner).not.toBeInTheDocument();
  });

  it("displays spinner during authorization request when token is changed", async () => {
    const match = { params: { token: "1234" } };
    const { rerender } = render(<ActivatePage match={match} />);
    await screen.findByText("Activation success");
    match.params.token = "4567";
    rerender(<ActivatePage match={match} />);
    const spinner = screen.getByRole("status");

    await screen.findByText("Activation fail");
    expect(spinner).not.toBeInTheDocument();
    expect(counter).toBe(2);
  });
});

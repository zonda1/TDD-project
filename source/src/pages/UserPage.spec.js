import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserPage from "./UserPage";

import { setupServer } from "msw/node";
import { rest } from "msw";

const server = setupServer();

beforeEach(() => {
  server.resetHandlers();
});
beforeAll(() => server.listen());
afterAll(() => server.close());

describe("User Page", () => {
  beforeEach(() => {
    server.use(
      rest.get("/api/1.0/users/:id", (req, res, ctx) => {
        if (req.params.id === "1") {
          return res(
            ctx.status(200),
            ctx.json({
              id: 1,
              username: "user1",
              email: "user1@mail.com",
              image: null,
            })
          );
        }
        return res(
          ctx.status(404),
          ctx.json({
            message: "User not found",
          })
        );
      })
    );
  });

  it("displays username after api call", async () => {
    const match = { params: { id: 1 } };

    render(<UserPage match={match} />);
    await waitFor(() => {
      expect(screen.queryByText("user1")).toBeInTheDocument();
    });
  });
  it("displays spinner during api call in progress", async () => {
    const match = { params: { id: 1 } };
    render(<UserPage match={match} />);
    const spinner = screen.getByRole("status");
    await screen.findByText("user1");
    expect(spinner).not.toBeInTheDocument();
  });
  it("displays alert message when user id is not found", async () => {
    const match = { params: { id: 100 } };
    render(<UserPage match={match} />);
    await waitFor(() => {
      expect(screen.queryByText("User not found")).toBeInTheDocument();
    });
  });
});

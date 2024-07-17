import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import userEvent from "@testing-library/user-event";

import { setupServer } from "msw/node";
import { rest } from "msw";

const server = setupServer(
  rest.post("/api/1.0/users/token/:token", (req, res, ctx) => {
    return res(ctx.status(200));
  }),
  rest.get("/api/1.0/users", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        content: [
          {
            id: "123",
            username: "test-user1",
            email: "test-user1@mail.ru",
            image: null,
          },
        ],
        page: 0,
        size: 0,
        totalPages: 0,
      })
    );
  }),
  rest.get("/api/1.0/users/:id", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 1,
        username: "user5",
        email: "user5@mail.com",
        image: null,
      })
    );
  }),
  rest.post("/api/1.0/auth", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 5,
        username: "user5",
      })
    );
  })
);

beforeEach(() => {
  server.resetHandlers();
});

beforeAll(() => server.listen());
afterAll(() => server.close());

const setup = (path) => {
  window.history.pushState({}, "", path);
  render(<App />);
};

describe("Routing", () => {
  it.each`
    path               | pageTestId
    ${"/"}             | ${"home-page"}
    ${"/signup"}       | ${"signup-page"}
    ${"/login"}        | ${"login-page"}
    ${"/user/1"}       | ${"user-page"}
    ${"/user/2"}       | ${"user-page"}
    ${"/activate/123"} | ${"activate-page"}
    ${"/activate/456"} | ${"activate-page"}
  `("displays $pageTestId when url is $path", ({ path, pageTestId }) => {
    setup(path);
    const page = screen.getByTestId(pageTestId);
    expect(page).toBeInTheDocument();
  });

  it.each`
    path               | pageTestId
    ${"/"}             | ${"signup-page"}
    ${"/"}             | ${"login-page"}
    ${"/"}             | ${"user-page"}
    ${"/"}             | ${"activate-page"}
    ${"/signup"}       | ${"home-page"}
    ${"/signup"}       | ${"login-page"}
    ${"/signup"}       | ${"user-page"}
    ${"/signup"}       | ${"activate-page"}
    ${"/login"}        | ${"home-page"}
    ${"/login"}        | ${"signup-page"}
    ${"/login"}        | ${"user-page"}
    ${"/login"}        | ${"activate-page"}
    ${"/user/1"}       | ${"home-page"}
    ${"/user/2"}       | ${"signup-page"}
    ${"/user/3"}       | ${"login-page"}
    ${"/user/4"}       | ${"activate-page"}
    ${"/activate/123"} | ${"home-page"}
    ${"/activate/123"} | ${"signup-page"}
    ${"/activate/123"} | ${"user-page"}
    ${"/activate/123"} | ${"login-page"}
  `(
    "doen not display $pageTestId when url is $path",
    ({ path, pageTestId }) => {
      setup(path);
      const page = screen.queryByTestId(pageTestId);
      expect(page).not.toBeInTheDocument();
    }
  );
  xit.each`
    targetPage
    ${"Home"}
    ${"Sign Up"}
    ${"Login"}
  `("navbar has $targetPage page link", ({ targetPage }) => {
    setup("/");
    const link = screen.getByRole("link", { name: targetPage });
    expect(link).toBeInTheDocument();
  });

  xit.each`
    startPath    | targetPage   | targetPageId
    ${"/"}       | ${"Sign Up"} | ${"signup-page"}
    ${"/"}       | ${"Login"}   | ${"login-page"}
    ${"/signup"} | ${"Home"}    | ${"home-page"}
    ${"/login"}  | ${"Home"}    | ${"home-page"}
  `(
    "displays $targetPageId after clicking $targetPage link",
    ({ startPath, targetPage, targetPageId }) => {
      setup(startPath);
      const link = screen.getByRole("link", { name: targetPage });
      userEvent.click(link);
      const page = screen.queryByTestId(targetPageId);
      expect(page).toBeInTheDocument();
    }
  );

  it("dispalys home page after clicking image", () => {
    setup("/signup");
    const img = screen.queryByAltText("Homelink-image");
    userEvent.click(img);
    expect(screen.queryByTestId("home-page")).toBeInTheDocument();
  });
  it("navigates to user page when clicking username on user list", async () => {
    setup("/");
    const userLink = await screen.findByText("test-user1");
    userEvent.click(userLink);
    const testUserPage = screen.queryByTestId("user-page");
    expect(testUserPage).toBeInTheDocument();
  });
});

describe("Login", () => {
  const setupLoggedIn = () => {
    setup("/login");
    userEvent.type(screen.queryByLabelText("E-mail"), "user5@mail.com");
    userEvent.type(screen.queryByLabelText("Password"), "Qwert5");
    userEvent.click(screen.queryByRole("button", { name: "Login" }));
  };

  it("redirects to homepage after successfull login", async () => {
    setupLoggedIn();
    await waitFor(() => {
      expect(screen.queryByTestId("home-page")).toBeInTheDocument();
    });
  });

  it("hides Login and Sign up links after successfull login", async () => {
    setupLoggedIn();
    await screen.findByTestId("home-page");
    const loginLink = screen.queryByRole("link", { name: "Login" });
    const signUpLink = screen.queryByRole("link", { name: "Sign Up" });
    expect(loginLink).not.toBeInTheDocument();
    expect(signUpLink).not.toBeInTheDocument();
  });
  it("displays My Profile links after successfull login", async () => {
    setupLoggedIn();
    const myProfileLinkBeforeLogin = screen.queryByRole("link", {
      name: "My Profile",
    });
    expect(myProfileLinkBeforeLogin).not.toBeInTheDocument();
    await screen.findByTestId("home-page");
    const myProfileLinkAfterLogin = screen.queryByRole("link", {
      name: "My Profile",
    });
    expect(myProfileLinkAfterLogin).toBeInTheDocument();
  });
  it("redirects to user id page after login and clicking to My profile link", async () => {
    setupLoggedIn();
    await screen.findByTestId("home-page");
    userEvent.click(
      screen.queryByRole("link", {
        name: "My Profile",
      })
    );
    await waitFor(() => {
      expect(screen.queryByTestId("user-page")).toBeInTheDocument();
    });
    const username = await screen.findByText("user5");
    expect(username).toBeInTheDocument();
  });
});

console.error = () => {};

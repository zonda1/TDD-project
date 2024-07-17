import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserList from "./UserList";

import { setupServer } from "msw/node";
import { rest } from "msw";
import { BrowserRouter as Router } from "react-router-dom";

const users = [
  { id: 1, username: "user1", email: "user1@mail.com", image: null },
  { id: 2, username: "user2", email: "user2@mail.com", image: null },
  { id: 3, username: "user3", email: "user3@mail.com", image: null },
  { id: 4, username: "user4", email: "user4@mail.com", image: null },
  { id: 5, username: "user5", email: "user5@mail.com", image: null },
  { id: 6, username: "user6", email: "user6@mail.com", image: null },
  { id: 7, username: "user7", email: "user7@mail.com", image: null },
];

const getPage = (page, size) => {
  const start = page * size;
  const end = start + size;
  const totalPages = Math.ceil(users.length / size);

  return {
    content: users.slice(start, end),
    page,
    size,
    totalPages,
  };
};

const server = setupServer(
  rest.get("/api/1.0/users", (req, res, ctx) => {
    let page = Number.parseInt(req.url.searchParams.get("page"));
    let size = Number.parseInt(req.url.searchParams.get("size"));
    if (Number.isNaN(page)) {
      page = 0;
    }
    if (Number.isNaN(size)) {
      size = 5;
    }
    return res(ctx.status(200), ctx.json(getPage(page, size)));
  })
);

beforeEach(() => {
  server.resetHandlers();
});
beforeAll(() => server.listen());
afterAll(() => server.close());

const setup = () => {
  render(
    <Router>
      <UserList />
    </Router>
  );
};

describe("User List", () => {
  describe("Interactions", () => {
    it("displays 3 users in list", async () => {
      setup();
      const users = await screen.findAllByText(/user/);
      expect(users.length).toBe(3);
    });

    it("displays next >", async () => {
      setup();
      const next = await screen.findByText("next >");
      expect(next).toBeInTheDocument();
    });
    it("displays next page after clicking next", async () => {
      setup();
      await screen.findByText("user1");
      userEvent.click(screen.queryByText("next >"));
      const pageWithUser4 = await screen.findByText("user4");
      expect(pageWithUser4).toBeInTheDocument();
    });
    it("hide next > when users are over", async () => {
      setup();
      await screen.findByText("user1");
      userEvent.click(screen.queryByText("next >"));
      await screen.findByText("user4");
      userEvent.click(screen.queryByText("next >"));
      await screen.findByText("user7");
      expect(screen.queryByText("next >")).not.toBeInTheDocument();
    });
    it("hide < previous on the first page", async () => {
      setup();
      await screen.findByText("user1");
      expect(screen.queryByText("< previous")).not.toBeInTheDocument();
    });
    it("displays < previous on the second page", async () => {
      setup();
      await screen.findByText("user1");
      userEvent.click(screen.queryByText("next >"));
      await screen.findByText("user4");
      expect(screen.queryByText("< previous")).toBeInTheDocument();
    });
    it("go to previous page after click < previous link", async () => {
      setup();
      await screen.findByText("user1");
      userEvent.click(screen.queryByText("next >"));
      await screen.findByText("user4");
      userEvent.click(screen.queryByText("< previous"));
      const pageWithUser1 = await screen.findByText("user1");
      expect(pageWithUser1).toBeInTheDocument();
    });
    it('displays spinner while api req in progress',async()=>{
      setup();
      const spinner=screen.getByRole('status');
      await screen.findByText("user1");
      expect(spinner).not.toBeInTheDocument();
    })
  });
  describe("Internationalization", () => {
    xit("initially displays header and navigation links in english", () => {});
    xit("displays header and navigation links in russian after changing language", () => {});
  });
});

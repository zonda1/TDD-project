import React, { Component } from "react";
import { getUsers } from "../api/apiCalls";
import { withRouter } from "react-router-dom";
import UserListItem from "./UserListItem";
import Spinner from "./Spinner";

class UserList extends Component {
  state = {
    page: {
      content: [],
      page: 0,
      size: 0,
      totalPages: 0,
    },
    apiCallInProgress: false,
  };

  componentDidMount() {
    this.getData();
  }

  getData = async (page) => {
    this.setState({ apiCallInProgress: true });
    try {
      const users = await getUsers(page);
      this.setState({ page: users.data });
    } catch (error) {}
    this.setState({ apiCallInProgress: false });
  };

  render() {
    const { apiCallInProgress } = this.state;
    const { totalPages, page, content } = this.state.page;

    return (
      <div className="card">
        <div className="card-header text-center">
          <h3>User List</h3>
        </div>
        <ul className="list-group list-group-flush">
          {content.map((user) => {
            return <UserListItem key={user.id} user={user} />;
          })}
        </ul>
        <div className="card-footer text-center">
          {page !== 0 && (
            <button
              className="btn btn-outline-secondary btn-sm float-start"
              onClick={() => this.getData(page - 1)}
            >
              &lt; previous
            </button>
          )}
          {totalPages > page + 1 && (
            <button
              className="btn btn-outline-secondary btn-sm float-end"
              onClick={() => this.getData(page + 1)}
            >
              next &gt;
            </button>
          )}
          {apiCallInProgress && <Spinner />}
        </div>
      </div>
    );
  }
}

export default UserList;

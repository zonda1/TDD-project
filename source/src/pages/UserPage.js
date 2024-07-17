import React, { Component } from "react";
import { getUser } from "../api/apiCalls";
import ProfileCard from "../components/ProfileCard";
import Alert from "../components/Alert";
import Spinner from "../components/Spinner";

class UserPage extends Component {
  state = {
    user: {},
    apiInProgress: false,
    failMessage: undefined,
  };

  async componentDidMount() {
    this.setState({ apiInProgress: true });
    try {
      const res = await getUser(this.props.match.params.id);
      this.setState({ user: res.data });
    } catch (error) {
      this.setState({ failMessage: error.response.data.message });
    }
    this.setState({ apiInProgress: false });
  }

  render() {
    const { user, apiInProgress, failMessage } = this.state;

    let content = (
      <Alert type="secondary" center>
        <Spinner size="big" />
      </Alert>
    );

    if (!apiInProgress) {
      if (failMessage) {
        content = (
          <Alert type="danger" center>
            {failMessage}
          </Alert>
        );
      } else {
        content = <ProfileCard user={user} />;
      }
    }

    return (
      <div data-testid="user-page">
        <h1>User Page</h1>
        {content}
      </div>
    );
  }
}

export default UserPage;

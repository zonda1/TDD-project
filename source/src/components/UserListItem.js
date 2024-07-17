import React from "react";
import { withRouter } from "react-router-dom/cjs/react-router-dom.min";
import profileUserImage from "../assets/37153188-profile.png";

const UserListItem = (props) => {
  const { user, history } = props;
  return (
    <li
      className="list-group-item list-group-item-action"
      onClick={() => history.push(`user/${user.id}`)}
    >
      <img src={profileUserImage} alt="profile" width="30" className='rounded-circle shadow-sm' />
      {user.username}
    </li>
  );
};

export default withRouter(UserListItem);

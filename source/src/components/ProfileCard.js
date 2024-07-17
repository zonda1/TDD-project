import React from "react";
import profileUserImage from "../assets/37153188-profile.png";

const ProfileCard = (props) => {
  const { user } = props;

  return (
    <div className="card text-center">
      <div className="card-header ">
        <img
          src={profileUserImage}
          alt="profile"
          width="100"
          className="rounded-circle shadow"
        />
      </div>
      <div className="card-body">
        <h3>{user.username}</h3>
      </div>
    </div>
  );
};

export default ProfileCard;

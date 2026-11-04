import "./Collaborators.css";

import Avatar from "../Avatar/Avatar";

function Collaborators() {
  const name = "Elis Cardoso";
  const photoUrl = undefined;

  return (
    <div className="users-avatars">
      <Avatar name={name} photoUrl={photoUrl} />
      <Avatar name={name} photoUrl={photoUrl} />
      <Avatar name={name} photoUrl={photoUrl} />
    </div>
  );
}

export default Collaborators;

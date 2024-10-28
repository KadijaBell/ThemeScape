import { useState } from 'react';

const ProfileButton = ({ user, onLogout }) => {
  const [showMenu, setShowMenu] = useState(false);

  const openMenu = () => {
    if (showMenu) return;
    setShowMenu(true);
  };

  const closeMenu = () => {
    setShowMenu(false);
  };

  return (
    <div className="profile-button" onClick={openMenu}>
      <button>{user.username}</button>
      {showMenu && (
        <div className="profile-dropdown" onMouseLeave={closeMenu}>
          <div>{user.username}</div>
          <div>{user.email}</div>
          <button onClick={onLogout}>Log Out</button>
        </div>
      )}
    </div>
  );
};

export default ProfileButton;

import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import * as sessionActions from '../../store/session';
import ProfileButton from '../ProfileButton/ProfileButton';

const Navigation = () => {
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);

  const handleLogout = (e) => {
    e.preventDefault();
    dispatch(sessionActions.logout());
  };

  return (
    <nav>
      <ul>
        <li>
          <NavLink to="/">Home</NavLink>
        </li>

        {sessionUser ? (

          <>
            <ProfileButton user={sessionUser} onLogout={handleLogout} />
            <li>
              <button onClick={handleLogout}>Log Out</button>
            </li>
          </>
        ) : (
          // Render Login and Sign Up links when no user is logged in
          <>
            <li>
              <NavLink to="/login">Login</NavLink>
            </li>
            <li>
              <NavLink to="/signup">Sign Up</NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navigation;

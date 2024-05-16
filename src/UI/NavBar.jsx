import { NavLink } from "react-router-dom";
import "../scss/NavBar.scss";
import { useUser } from "../UserProvider";
function NavBar() {
  const { user } = useUser();
  const user_id = user?.user?.user_id;
  return (
    <div className="navbar">
      <div className="logo-ctn">
        <img src="/logo.png" alt="logo" />
        <h1>HUSC Student Infomation Exchange</h1>
      </div>
      <ul>
        <li>
          <NavLink exact="/home" to="/home">
            <img src="/home-icon.png" alt="home-icon" />
            <p>Home</p>
          </NavLink>
        </li>

        <li>
          <NavLink to="/messages">
            <img src="/message-text.png" alt="message-icon" />
            <p>Message</p>
          </NavLink>
        </li>
        <li>
          <NavLink exact="/home/profile/" to={`/home/profile/${user_id}`}>
            <img src="/user-square.png" alt="user-icon" />
            <p>My Profile</p>
          </NavLink>
        </li>
        <li>
          <NavLink to="savedpost">
            <img src="/save-icon.png" alt="save-icon" />
            <p>Saved Post</p>
          </NavLink>
        </li>
      </ul>
    </div>
  );
}

export default NavBar;

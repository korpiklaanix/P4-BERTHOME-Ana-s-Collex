import { Link, NavLink } from "react-router";
import "./NavBar.css";
import LogoCollex from "../../assets/images/LogoCollex.png";
function NavBar() {
  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="navbar__logo">
        <img src={LogoCollex} alt="Logo Collex" />
      </Link>

      {/* Navigation */}
      <div className="navbar__links">
        <NavLink to="/" className="navbar__link">
          Home
        </NavLink>

        <NavLink to="/collections" className="navbar__link">
          Collections
        </NavLink>

        <NavLink to="/about" className="navbar__link">
          About us
        </NavLink>
      </div>
    </nav>
  );
}

export default NavBar;

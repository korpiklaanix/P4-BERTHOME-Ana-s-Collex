import { useState } from "react";
import { Link, NavLink } from "react-router";
import "./NavBar.css";
import LogoCollex from "../../assets/images/LogoCollex.png";

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="navbar__logo" onClick={closeMenu}>
        <img src={LogoCollex} alt="Logo Collex" />
      </Link>

      {/* Burger (mobile) */}
      <button
        type="button"
        className="navbar__burger"
        aria-label="Ouvrir le menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
      >
        <span className="navbar__burgerLine" />
        <span className="navbar__burgerLine" />
        <span className="navbar__burgerLine" />
      </button>

      {/* Navigation */}
      <div className={`navbar__links ${isOpen ? "is-open" : ""}`}>
        <NavLink to="/" className="navbar__link" onClick={closeMenu}>
          Home
        </NavLink>

        <NavLink to="/collections" className="navbar__link" onClick={closeMenu}>
          Collections
        </NavLink>

        <NavLink to="/about" className="navbar__link" onClick={closeMenu}>
          About us
        </NavLink>
      </div>

      {isOpen && (
        <button
          type="button"
          className="navbar__overlay"
          aria-label="Fermer le menu"
          onClick={closeMenu}
        />
      )}
    </nav>
  );
}

export default NavBar;

import { Link, NavLink } from "react-router";
import "./Footer.css";
import LogoCollex from "../../assets/images/LogoCollex.png";

function Footer() {
  return (
    <footer className="footer">
      <Link to="/" className="footer__logo">
        <img src={LogoCollex} alt="Logo Collex" />
      </Link>

      <div className="footer__links">
        <NavLink to="/Mentions" className="footer__link">
          Mentions Légales
        </NavLink>
      </div>

      <div className="footer__copyright">
        © {new Date().getFullYear()} Collex
      </div>
    </footer>
  );
}

export default Footer;

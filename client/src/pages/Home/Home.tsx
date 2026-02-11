import { Link } from "react-router";
import "./Home.css";

function Home() {
  return (
    <section className="home">
      <div className="home__content">
        <h1 className="home__title">Bienvenue sur Collex</h1>

        <p className="home__subtitle">
          Le site pour garder un œil sur toutes tes collections. Organise,
          ajoute, modifie… et retrouve tes trésors en un clin d'œil.
        </p>

        <Link to="/collections" className="home__button">
          Voir mes collections
        </Link>
      </div>
    </section>
  );
}

export default Home;

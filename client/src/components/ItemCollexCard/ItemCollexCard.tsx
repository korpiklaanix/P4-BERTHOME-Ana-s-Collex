import { Link } from "react-router";
import "./ItemCollexCard.css";

type ItemCollexCardProps = {
  id: number;
  title: string;
  coverPhotoUrl?: string | null;
  acquiredDate?: string | null;
  to?: string;
};

function ItemCollexCard({
  id,
  title,
  coverPhotoUrl,
  acquiredDate,
  to,
}: ItemCollexCardProps) {
  const linkTo = to ?? `/items/${id}`;

  return (
    <Link to={linkTo} className="itemcollex">
      <div className="itemcollex__media">
        {coverPhotoUrl ? (
          <img
            className="itemcollex__img"
            src={coverPhotoUrl}
            alt={title}
            loading="lazy"
          />
        ) : (
          <div className="itemcollex__placeholder" aria-hidden="true">
            <span>Collex</span>
          </div>
        )}
      </div>

      <div className="itemcollex__content">
        <h3 className="itemcollex__title">{title}</h3>

        {acquiredDate && (
          <p className="itemcollex__meta">
            Ajouté le {new Date(acquiredDate).toLocaleDateString()}
          </p>
        )}
      </div>
    </Link>
  );
}

export default ItemCollexCard;

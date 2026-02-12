import { Link } from "react-router";
import "./CollectionCard.css";

type CollectionCardProps = {
  id: number;
  name: string;
  categoryLabel: string;
};

function CollectionCard({ id, name, categoryLabel }: CollectionCardProps) {
  return (
    <Link to={`/collections/${id}`} className="collectioncard">
      <h2 className="collectioncard__title">{name}</h2>
      <p className="collectioncard__category">{categoryLabel}</p>
    </Link>
  );
}

export default CollectionCard;

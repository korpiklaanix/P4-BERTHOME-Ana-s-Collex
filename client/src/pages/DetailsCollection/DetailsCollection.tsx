import { type FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import "./DetailsCollection.css";
import ItemCollexCard from "../../components/ItemCollexCard/ItemCollexCard";

type CollectionDetails = {
  id: number;
  name: string;
  description: string | null;
  category_label: string;
};

type Category = {
  id: number;
  label: string;
};

type ItemDTO = {
  id: number;
  title: string;
  cover_photo_url: string | null;
  acquired_date: string | null;
};

function DetailsCollection() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [collection, setCollection] = useState<CollectionDetails | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [message, setMessage] = useState("");

  const [items, setItems] = useState<ItemDTO[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [itemTitle, setItemTitle] = useState("");
  const [itemPhotoUrl, setItemPhotoUrl] = useState("");
  const [itemError, setItemError] = useState("");

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const run = async () => {
      setIsLoading(true);
      setItemsLoading(true);

      try {
        const [collectionRes, categoriesRes, itemsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/collections/${id}`, {
            signal: controller.signal,
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/categories`, {
            signal: controller.signal,
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/collections/${id}/items`, {
            signal: controller.signal,
          }),
        ]);

        if (!collectionRes.ok) throw new Error("Collection non trouvée");
        if (!categoriesRes.ok) throw new Error("Catégories non trouvées");
        if (!itemsRes.ok) throw new Error("Items non trouvés");

        const collectionData: CollectionDetails = await collectionRes.json();
        const categoriesData: Category[] = await categoriesRes.json();
        const itemsData: ItemDTO[] = await itemsRes.json();

        setCollection(collectionData);
        setCategories(categoriesData);
        setName(collectionData.name);

        const currentCategory = categoriesData.find(
          (c) => c.label === collectionData.category_label,
        );
        setCategoryId(currentCategory?.id ?? "");

        setItems(Array.isArray(itemsData) ? itemsData : []);
        setMessage("");
      } catch {
        setCollection(null);
        setCategories([]);
        setItems([]);
      } finally {
        setIsLoading(false);
        setItemsLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [id]);

  const refreshItems = async () => {
    if (!id) return;
    setItemsLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/collections/${id}/items`,
      );
      const data: ItemDTO[] = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setItemsLoading(false);
    }
  };

  const refreshCollection = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [collectionRes, categoriesRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/collections/${id}`),
        fetch(`${import.meta.env.VITE_API_URL}/api/categories`),
      ]);

      const collectionData: CollectionDetails = await collectionRes.json();
      const categoriesData: Category[] = await categoriesRes.json();

      setCollection(collectionData);
      setCategories(categoriesData);
      setName(collectionData.name);

      const currentCategory = categoriesData.find(
        (c) => c.label === collectionData.category_label,
      );
      setCategoryId(currentCategory?.id ?? "");
    } catch {
      setCollection(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!id) return;

    const confirm = window.confirm(
      "Êtes-vous sûr de vouloir modifier cette collection ?",
    );
    if (!confirm) return;

    if (!name.trim()) {
      alert("Le nom est obligatoire.");
      return;
    }
    if (categoryId === "") {
      alert("Veuillez choisir une catégorie.");
      return;
    }

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/collections/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), category_id: categoryId }),
      },
    );

    if (!res.ok) {
      alert("Erreur lors de la modification");
      return;
    }

    setIsEditing(false);
    setMessage("Collection modifiée ✅");
    await refreshCollection();
  };

  const handleDelete = async () => {
    if (!id) return;

    const confirm = window.confirm("Supprimer cette collection ?");
    if (!confirm) return;

    await fetch(`${import.meta.env.VITE_API_URL}/api/collections/${id}`, {
      method: "DELETE",
    });

    navigate("/collections");
  };

  const handleAddItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setItemError("");

    if (!itemTitle.trim()) {
      setItemError("Le nom de l’item est obligatoire.");
      return;
    }

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/collections/${id}/items`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: itemTitle.trim(),
          cover_photo_url: itemPhotoUrl.trim() ? itemPhotoUrl.trim() : null,
        }),
      },
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      setItemError(errorData?.message ?? "Impossible d’ajouter l’item.");
      return;
    }

    setItemTitle("");
    setItemPhotoUrl("");
    setIsAddingItem(false);

    await refreshItems();
  };

  if (isLoading) return <p>Chargement...</p>;
  if (!collection) return <p>Introuvable</p>;

  return (
    <section className="details">
      <header className="details__header">
        {!isEditing ? (
          <h1>{collection.name}</h1>
        ) : (
          <input
            className="details__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        {!isEditing ? (
          <p className="details__category">{collection.category_label}</p>
        ) : (
          <select
            className="details__input"
            value={categoryId}
            onChange={(e) => {
              const v = e.target.value;
              setCategoryId(v === "" ? "" : Number(v));
            }}
          >
            <option value="">Choisir catégorie</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        )}

        <div className="details__actions">
          {!isEditing ? (
            <button
              type="button"
              className="details__btn"
              onClick={() => setIsEditing(true)}
            >
              Modifier
            </button>
          ) : (
            <>
              <button
                type="button"
                className="details__btn"
                onClick={handleUpdate}
              >
                Valider
              </button>

              <button
                type="button"
                className="details__btn details__btn--ghost"
                onClick={() => {
                  setIsEditing(false);

                  if (!collection) return;

                  setName(collection.name);
                  const currentCategory = categories.find(
                    (c) => c.label === collection.category_label,
                  );
                  setCategoryId(currentCategory?.id ?? "");
                  setMessage("");
                }}
              >
                Annuler
              </button>
            </>
          )}

          <button
            type="button"
            className="details__btn details__btn--danger"
            onClick={handleDelete}
          >
            Supprimer
          </button>
        </div>
      </header>

      {message && <p className="details__success">{message}</p>}

      <section className="details__items">
        <div className="details__itemsHeader">
          <h2>Items</h2>

          {!isAddingItem ? (
            <button
              className="details__btn"
              type="button"
              onClick={() => {
                setIsAddingItem(true);
                setItemError("");
              }}
            >
              + Ajouter un item
            </button>
          ) : (
            <form className="details__addForm" onSubmit={handleAddItem}>
              <input
                className="details__input"
                type="text"
                value={itemTitle}
                placeholder="Nom de l’item"
                onChange={(e) => setItemTitle(e.target.value)}
              />
              <input
                className="details__input"
                type="text"
                value={itemPhotoUrl}
                placeholder="URL de la photo (optionnel)"
                onChange={(e) => setItemPhotoUrl(e.target.value)}
              />

              <div className="details__addActions">
                <button className="details__btn" type="submit">
                  Ajouter
                </button>
                <button
                  className="details__btn details__btn--ghost"
                  type="button"
                  onClick={() => {
                    setIsAddingItem(false);
                    setItemTitle("");
                    setItemPhotoUrl("");
                    setItemError("");
                  }}
                >
                  Annuler
                </button>
              </div>

              {itemError && <p className="details__error">{itemError}</p>}
            </form>
          )}
        </div>

        {itemsLoading ? (
          <p className="details__state">Chargement des items...</p>
        ) : items.length === 0 ? (
          <p className="details__state">Aucun item pour le moment</p>
        ) : (
          <div className="details__itemsGrid">
            {items.map((item) => (
              <ItemCollexCard
                key={item.id}
                id={item.id}
                title={item.title}
                coverPhotoUrl={item.cover_photo_url}
                acquiredDate={item.acquired_date}
                to={`/items/${item.id}`}
              />
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

export default DetailsCollection;

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

const API_URL = import.meta.env.VITE_API_URL as string;

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
  const [itemPhotoFile, setItemPhotoFile] = useState<File | null>(null);
  const [itemError, setItemError] = useState("");
  const [isAddingItemLoading, setIsAddingItemLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const run = async () => {
      setIsLoading(true);
      setItemsLoading(true);

      try {
        const [collectionRes, categoriesRes, itemsRes] = await Promise.all([
          fetch(`${API_URL}/api/collections/${id}`, {
            signal: controller.signal,
          }),
          fetch(`${API_URL}/api/categories`, { signal: controller.signal }),
          fetch(`${API_URL}/api/collections/${id}/items`, {
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
      const res = await fetch(`${API_URL}/api/collections/${id}/items`);
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
        fetch(`${API_URL}/api/collections/${id}`),
        fetch(`${API_URL}/api/categories`),
      ]);

      if (!collectionRes.ok) throw new Error("Collection non trouvée");
      if (!categoriesRes.ok) throw new Error("Catégories non trouvées");

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

    const res = await fetch(`${API_URL}/api/collections/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), category_id: categoryId }),
    });

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

    await fetch(`${API_URL}/api/collections/${id}`, { method: "DELETE" });
    navigate("/collections");
  };

  const handleAddItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setItemError("");
    setIsAddingItemLoading(true);

    try {
      if (!itemTitle.trim()) {
        setItemError("Le nom de l’item est obligatoire.");
        return;
      }

      const createRes = await fetch(`${API_URL}/api/collections/${id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: itemTitle.trim(),
          cover_photo_url: null,
        }),
      });

      if (!createRes.ok) {
        const errorData = await createRes.json().catch(() => null);
        setItemError(errorData?.message ?? "Impossible d’ajouter l’item.");
        return;
      }

      const created = (await createRes.json()) as {
        insertId?: number;
        id?: number;
      };
      const newItemId = created.insertId ?? created.id;

      if (!newItemId) {
        setItemError("Item créé, mais impossible de récupérer son id.");
        return;
      }

      if (itemPhotoFile) {
        const formData = new FormData();
        formData.append("photos", itemPhotoFile);

        const uploadRes = await fetch(
          `${API_URL}/api/items/${newItemId}/photos`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => null);
          setItemError(
            err?.message ?? "Item créé, mais upload photo impossible.",
          );
        } else {
          const uploaded = await uploadRes.json().catch(() => null);
          const newPhotoId = uploaded?.id ?? uploaded?.insertId;

          if (newPhotoId) {
            await fetch(
              `${API_URL}/api/items/${newItemId}/photos/${newPhotoId}/primary`,
              { method: "PATCH" },
            );
          }
        }
      }

      setItemTitle("");
      setItemPhotoFile(null);
      setIsAddingItem(false);
      await refreshItems();
    } finally {
      setIsAddingItemLoading(false);
    }
  };

  if (isLoading) return <p>Chargement...</p>;
  if (!collection) return <p>Introuvable</p>;
  console.log(
    "items cover_photo_url",
    items.map((i) => ({ id: i.id, cover: i.cover_photo_url })),
  );
  return (
    <section className="details">
      <header className="details__header">
        <div className="details__headerLeft">
          <button
            type="button"
            className="details__back"
            onClick={() => navigate("/collections")}
          >
            ← Toutes mes collections
          </button>
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
        </div>
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
                type="file"
                accept="image/*"
                onChange={(e) => setItemPhotoFile(e.target.files?.[0] ?? null)}
              />

              <div className="details__addActions">
                <button
                  className="details__btn"
                  type="submit"
                  disabled={isAddingItemLoading}
                >
                  {isAddingItemLoading ? "Ajout..." : "Ajouter"}
                </button>

                <button
                  className="details__btn details__btn--ghost"
                  type="button"
                  onClick={() => {
                    setIsAddingItem(false);
                    setItemTitle("");
                    setItemPhotoFile(null);
                    setItemError("");
                  }}
                  disabled={isAddingItemLoading}
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
          <div
            className={`details__itemsGrid ${
              items.length >= 3
                ? "details__itemsGrid--many"
                : "details__itemsGrid--few"
            }`}
          >
            {items.map((it) => (
              <ItemCollexCard
                key={it.id}
                id={it.id}
                title={it.title}
                coverPhotoUrl={it.cover_photo_url}
                acquiredDate={it.acquired_date}
                to={`/items/${it.id}`}
              />
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

export default DetailsCollection;

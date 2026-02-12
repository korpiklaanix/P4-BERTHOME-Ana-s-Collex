import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import "./DetailItemCollection.css";

type ItemDetailsDTO = {
  id: number;
  collection_id: number;
  title: string;
  cover_photo_url: string | null;
  acquired_date: string | null;
  description: string | null;
};

function DetailItemCollection() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState<ItemDetailsDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [coverPhotoUrl, setCoverPhotoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const run = async () => {
      setIsLoading(true);
      setErrorMsg("");
      setMessage("");

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/items/${id}`,
          {
            signal: controller.signal,
          },
        );

        if (!res.ok) throw new Error("not found");

        const data: ItemDetailsDTO = await res.json();

        setItem(data);
        setTitle(data.title);
        setCoverPhotoUrl(data.cover_photo_url ?? "");
        setDescription(data.description ?? "");
      } catch {
        setItem(null);
      } finally {
        setIsLoading(false);
      }
    };

    run();

    return () => controller.abort();
  }, [id]);

  const refreshItem = async () => {
    if (!id) return;

    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/items/${id}`,
      );
      if (!res.ok) throw new Error("not found");

      const data: ItemDetailsDTO = await res.json();
      setItem(data);

      setTitle(data.title);
      setCoverPhotoUrl(data.cover_photo_url ?? "");
      setDescription(data.description ?? "");
    } catch {
      setItem(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!id) return;

    setErrorMsg("");
    setMessage("");

    if (!title.trim()) {
      setErrorMsg("Le titre est obligatoire.");
      return;
    }

    const confirm = window.confirm(
      "Êtes-vous sûr de vouloir modifier cet item ?",
    );
    if (!confirm) return;

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        cover_photo_url: coverPhotoUrl.trim() ? coverPhotoUrl.trim() : null,
        description: description.trim() ? description.trim() : null,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      setErrorMsg(err?.message ?? "Impossible de modifier l’item.");
      return;
    }

    setIsEditing(false);
    setMessage("Item modifié ✅");
    await refreshItem();
  };

  const handleDelete = async () => {
    if (!id || !item) return;

    setErrorMsg("");
    setMessage("");

    const confirm = window.confirm("Supprimer cet item ?");
    if (!confirm) return;

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/items/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      setErrorMsg("Impossible de supprimer l’item.");
      return;
    }

    navigate(`/collections/${item.collection_id}`);
  };

  if (isLoading) return <p className="itemdetail__state">Chargement...</p>;
  if (!item) return <p className="itemdetail__state">Item introuvable</p>;

  return (
    <section className="itemdetail">
      <div className="itemdetail__top">
        <button
          type="button"
          className="itemdetail__back"
          onClick={() => navigate(`/collections/${item.collection_id}`)}
        >
          ← Retour collection
        </button>

        <div className="itemdetail__actions">
          {!isEditing ? (
            <button
              type="button"
              className="itemdetail__btn"
              onClick={() => setIsEditing(true)}
            >
              Modifier
            </button>
          ) : (
            <>
              <button
                type="button"
                className="itemdetail__btn"
                onClick={handleUpdate}
              >
                Valider
              </button>

              <button
                type="button"
                className="itemdetail__btn itemdetail__btn--ghost"
                onClick={() => {
                  setIsEditing(false);
                  setErrorMsg("");
                  setMessage("");
                  setTitle(item.title);
                  setCoverPhotoUrl(item.cover_photo_url ?? "");
                  setDescription(item.description ?? "");
                }}
              >
                Annuler
              </button>
            </>
          )}

          <button
            type="button"
            className="itemdetail__btn itemdetail__btn--danger"
            onClick={handleDelete}
          >
            Supprimer
          </button>
        </div>
      </div>

      <div className="itemdetail__card">
        <div className="itemdetail__media">
          {coverPhotoUrl || item.cover_photo_url ? (
            <img
              src={coverPhotoUrl || item.cover_photo_url || ""}
              alt={title || item.title}
            />
          ) : (
            <div className="itemdetail__placeholder">
              <span>Collex</span>
            </div>
          )}
        </div>

        <div className="itemdetail__content">
          {!isEditing ? (
            <h1 className="itemdetail__title">{item.title}</h1>
          ) : (
            <input
              className="itemdetail__input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre"
            />
          )}

          {!isEditing ? (
            <p className="itemdetail__desc">
              {item.description
                ? item.description
                : "Aucune description pour le moment."}
            </p>
          ) : (
            <textarea
              className="itemdetail__textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              rows={5}
            />
          )}

          {isEditing && (
            <input
              className="itemdetail__input"
              value={coverPhotoUrl}
              onChange={(e) => setCoverPhotoUrl(e.target.value)}
              placeholder="URL de la photo (optionnel)"
            />
          )}

          {message && <p className="itemdetail__success">{message}</p>}
          {errorMsg && <p className="itemdetail__error">{errorMsg}</p>}
        </div>
      </div>
    </section>
  );
}

export default DetailItemCollection;

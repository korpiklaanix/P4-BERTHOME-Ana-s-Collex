import { useCallback, useEffect, useMemo, useState } from "react";
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

type ItemPhotoDTO = {
  id: number;
  item_id: number;
  url: string;
  is_primary: 0 | 1;
  created_at: string;
};

const MAX_PHOTOS = 5;
const API_URL = import.meta.env.VITE_API_URL as string;

const toImgSrc = (url: string) =>
  url && !url.startsWith("http://") && !url.startsWith("https://")
    ? `${API_URL}${url}`
    : url;

function DetailItemCollection() {
  const { id } = useParams();
  const navigate = useNavigate();

  const itemId = Number(id);

  const [item, setItem] = useState<ItemDetailsDTO | null>(null);
  const [photos, setPhotos] = useState<ItemPhotoDTO[]>([]);
  const [activePhotoUrl, setActivePhotoUrl] = useState<string>("");

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [isUploading, setIsUploading] = useState(false);

  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const activeSrc = useMemo(() => {
    const raw =
      activePhotoUrl || item?.cover_photo_url || (photos[0]?.url ?? "");
    return raw ? toImgSrc(raw) : "";
  }, [activePhotoUrl, item?.cover_photo_url, photos]);

  const loadAll = useCallback(
    async (signal?: AbortSignal) => {
      if (!Number.isFinite(itemId)) return;

      setIsLoading(true);
      setErrorMsg("");
      setMessage("");

      try {
        const [itemRes, photosRes] = await Promise.all([
          fetch(`${API_URL}/api/items/${itemId}`, { signal }),
          fetch(`${API_URL}/api/items/${itemId}/photos`, { signal }),
        ]);

        if (!itemRes.ok) throw new Error("Item introuvable");

        const itemData: ItemDetailsDTO = await itemRes.json();
        const photosData = photosRes.ok ? await photosRes.json() : [];
        const safePhotos: ItemPhotoDTO[] = Array.isArray(photosData)
          ? photosData
          : [];

        setItem(itemData);
        setPhotos(safePhotos);

        setTitle(itemData.title);
        setDescription(itemData.description ?? "");

        const primary =
          safePhotos.find((p) => p.is_primary === 1) ?? safePhotos[0] ?? null;

        setActivePhotoUrl(primary?.url ?? itemData.cover_photo_url ?? "");
      } catch (e) {
        // ✅ IMPORTANT : on ignore les aborts
        if (e instanceof DOMException && e.name === "AbortError") return;

        setItem(null);
        setPhotos([]);
        setActivePhotoUrl("");
        setErrorMsg(e instanceof Error ? e.message : "Erreur");
      } finally {
        // ✅ si abort, parfois inutile de setState aussi (mais ok)
        setIsLoading(false);
      }
    },
    [itemId],
  );

  useEffect(() => {
    if (!Number.isFinite(itemId)) return;

    const controller = new AbortController();
    loadAll(controller.signal);

    return () => controller.abort();
  }, [itemId, loadAll]);

  const handleUploadPhotos = async (files: FileList | null) => {
    if (!Number.isFinite(itemId)) return;
    if (!files || files.length === 0) return;

    if (photos.length >= MAX_PHOTOS) {
      setErrorMsg(`Limite atteinte : ${MAX_PHOTOS} photos max.`);
      return;
    }

    const file = files[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("photos", file);

      const res = await fetch(`${API_URL}/api/items/${itemId}/photos`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(
          err?.message ?? `Upload impossible (HTTP ${res.status})`,
        );
      }

      setMessage("Photo uploadée ✅");
      await loadAll();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Upload impossible");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetPrimary = async (photoId: number) => {
    if (!Number.isFinite(itemId)) return;

    setErrorMsg("");
    setMessage("");
    setIsUploading(true);

    try {
      const res = await fetch(
        `${API_URL}/api/items/${itemId}/photos/${photoId}/primary`,
        { method: "PATCH" },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message ?? "Impossible de mettre en principale");
      }

      setMessage("Photo principale mise à jour ✅");
      await loadAll();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Erreur");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!Number.isFinite(itemId)) return;

    setErrorMsg("");
    setMessage("");

    const confirm = window.confirm("Supprimer cette photo ?");
    if (!confirm) return;

    setIsUploading(true);

    try {
      const res = await fetch(
        `${API_URL}/api/items/${itemId}/photos/${photoId}`,
        { method: "DELETE" },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message ?? "Impossible de supprimer la photo");
      }

      setMessage("Photo supprimée ✅");
      await loadAll();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Erreur");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdate = async () => {
    if (!Number.isFinite(itemId)) return;

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

    const res = await fetch(`${API_URL}/api/items/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
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
    await loadAll();
  };

  const handleDeleteItem = async () => {
    if (!item || !Number.isFinite(itemId)) return;

    setErrorMsg("");
    setMessage("");

    const confirm = window.confirm("Supprimer cet item ?");
    if (!confirm) return;

    const res = await fetch(`${API_URL}/api/items/${itemId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      setErrorMsg("Impossible de supprimer l’item.");
      return;
    }

    navigate(`/collections/${item.collection_id}`);
  };

  const handleCancelEdit = () => {
    if (!item) return;

    setIsEditing(false);
    setErrorMsg("");
    setMessage("");

    setTitle(item.title);
    setDescription(item.description ?? "");

    const primary = photos.find((p) => p.is_primary === 1) ?? photos[0] ?? null;
    setActivePhotoUrl(primary?.url ?? item.cover_photo_url ?? "");
  };

  const isActiveThumb = (url: string) => {
    const currentRaw =
      activePhotoUrl || item?.cover_photo_url || (photos[0]?.url ?? "") || "";
    return currentRaw === url;
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
                disabled={isUploading}
              >
                Valider
              </button>

              <button
                type="button"
                className="itemdetail__btn itemdetail__btn--ghost"
                onClick={handleCancelEdit}
                disabled={isUploading}
              >
                Annuler
              </button>
            </>
          )}

          <button
            type="button"
            className="itemdetail__btn itemdetail__btn--danger"
            onClick={handleDeleteItem}
            disabled={isUploading}
          >
            Supprimer
          </button>
        </div>
      </div>

      <div className="itemdetail__card">
        <div className="itemdetail__media">
          {activeSrc ? (
            <img src={activeSrc} alt={title || item.title} />
          ) : (
            <div className="itemdetail__placeholder">
              <span>Collex</span>
            </div>
          )}

          {photos.length > 0 && (
            <>
              <div className="itemdetail__thumbs">
                {photos.slice(0, MAX_PHOTOS).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`itemdetail__thumb ${
                      isActiveThumb(p.url) ? "is-active" : ""
                    }`}
                    onClick={() => setActivePhotoUrl(p.url)}
                    aria-label="Voir la photo"
                  >
                    <img src={toImgSrc(p.url)} alt="miniature" />
                  </button>
                ))}
              </div>

              <p className="itemdetail__thumbHint">
                {photos.length}/{MAX_PHOTOS} photos
              </p>
            </>
          )}
        </div>

        <div className="itemdetail__content">
          {!isEditing ? (
            <h1 className="itemdetail__title">{item.title}</h1>
          ) : (
            <>
              <input
                className="itemdetail__input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre"
              />

              <div className="itemdetail__upload">
                <label
                  className="itemdetail__uploadLabel"
                  htmlFor="photoUpload"
                >
                  Ajouter une photo ({photos.length}/{MAX_PHOTOS})
                </label>

                <input
                  id="photoUpload"
                  type="file"
                  accept="image/*"
                  disabled={isUploading || photos.length >= MAX_PHOTOS}
                  onChange={(e) => {
                    handleUploadPhotos(e.target.files);
                    e.currentTarget.value = "";
                  }}
                />

                {photos.length >= MAX_PHOTOS && (
                  <p className="itemdetail__state">
                    Limite atteinte : {MAX_PHOTOS} photos max.
                  </p>
                )}

                {isUploading && (
                  <p className="itemdetail__state">Traitement en cours...</p>
                )}
              </div>

              {photos.length > 0 && (
                <div className="itemdetail__photoActions">
                  <p className="itemdetail__state">Gestion des photos :</p>

                  <div className="itemdetail__photoActionsGrid">
                    {photos.slice(0, MAX_PHOTOS).map((p) => (
                      <div className="itemdetail__photoRow" key={p.id}>
                        <button
                          type="button"
                          className={`itemdetail__mini ${
                            isActiveThumb(p.url) ? "is-active" : ""
                          }`}
                          onClick={() => setActivePhotoUrl(p.url)}
                        >
                          <img src={toImgSrc(p.url)} alt="mini" />
                        </button>

                        <div className="itemdetail__photoRowBtns">
                          <button
                            type="button"
                            className="itemdetail__btn"
                            onClick={() => handleSetPrimary(p.id)}
                            disabled={isUploading || p.is_primary === 1}
                          >
                            {p.is_primary === 1
                              ? "Principale"
                              : "Mettre principale"}
                          </button>

                          <button
                            type="button"
                            className="itemdetail__btn itemdetail__btn--danger"
                            onClick={() => handleDeletePhoto(p.id)}
                            disabled={isUploading}
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
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

          {message && <p className="itemdetail__success">{message}</p>}
          {errorMsg && <p className="itemdetail__error">{errorMsg}</p>}
        </div>
      </div>
    </section>
  );
}

export default DetailItemCollection;

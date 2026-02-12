import { type FormEvent, useEffect, useState } from "react";
import CollectionCard from "../../components/CollectionCard/CollectionCard";
import "./AllCollection.css";

type CollectionDTO = {
  id: number;
  name: string;
  category_label: string;
};

type CategoryDTO = {
  id: number;
  label: string;
};

function AllCollection() {
  const [collections, setCollections] = useState<CollectionDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [errorMsg, setErrorMsg] = useState("");

  const refresh = async () => {
    setIsLoading(true);
    try {
      const [collectionsRes, categoriesRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/collections`),
        fetch(`${import.meta.env.VITE_API_URL}/api/categories`),
      ]);

      const collectionsData: CollectionDTO[] = await collectionsRes.json();
      const categoriesData: CategoryDTO[] = await categoriesRes.json();

      setCollections(Array.isArray(collectionsData) ? collectionsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    const run = async () => {
      setIsLoading(true);
      try {
        const [collectionsRes, categoriesRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/collections`, {
            signal: controller.signal,
          }),
          fetch(`${import.meta.env.VITE_API_URL}/api/categories`, {
            signal: controller.signal,
          }),
        ]);

        const collectionsData: CollectionDTO[] = await collectionsRes.json();
        const categoriesData: CategoryDTO[] = await categoriesRes.json();

        setCollections(Array.isArray(collectionsData) ? collectionsData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch {
        setCollections([]);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Le nom de la collection est obligatoire.");
      return;
    }

    if (categoryId === "") {
      setErrorMsg("Choisis une catégorie.");
      return;
    }

    console.log("CREATE payload:", {
      name: name.trim(),
      category_id: categoryId,
    });

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/collections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        category_id: categoryId,
        description: null,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      setErrorMsg(
        errorData?.detail ??
          errorData?.message ??
          "Impossible de créer la collection.",
      );
      return;
    }

    setName("");
    setCategoryId("");
    setIsFormOpen(false);
    await refresh();
  };

  return (
    <section className="allcollections">
      <div className="allcollections__header">
        <h1 className="allcollections__title">Mes collections</h1>

        <button
          type="button"
          className="allcollections__btn"
          onClick={() => setIsFormOpen((v) => !v)}
        >
          + Ajouter une collection
        </button>
      </div>

      {isFormOpen && (
        <form className="allcollections__form" onSubmit={handleCreate}>
          <input
            className="allcollections__input"
            type="text"
            value={name}
            placeholder="Nom de la collection (ex: LEGO Star Wars)"
            onChange={(e) => setName(e.target.value)}
          />

          <select
            className="allcollections__select"
            value={categoryId}
            onChange={(e) =>
              setCategoryId(e.target.value ? Number(e.target.value) : "")
            }
          >
            <option value="">-- Choisir une catégorie --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>

          <div className="allcollections__formActions">
            <button type="submit" className="allcollections__btn">
              Créer
            </button>

            <button
              type="button"
              className="allcollections__btn allcollections__btn--ghost"
              onClick={() => setIsFormOpen(false)}
            >
              Annuler
            </button>
          </div>

          {errorMsg && <p className="allcollections__error">{errorMsg}</p>}
        </form>
      )}

      {isLoading ? (
        <p className="allcollections__state">Chargement...</p>
      ) : (
        <div className="allcollections__grid">
          {collections.map((c) => (
            <CollectionCard
              key={c.id}
              id={c.id}
              name={c.name}
              categoryLabel={c.category_label}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default AllCollection;

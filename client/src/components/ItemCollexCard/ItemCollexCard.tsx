import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import "./ItemCollexCard.css";

type ItemPhotoDTO = {
  id: number;
  item_id: number;
  url: string;
  is_primary: 0 | 1;
  created_at: string;
};

type ItemCollexCardProps = {
  id: number;
  title: string;
  coverPhotoUrl?: string | null;
  acquiredDate?: string | null;
  to?: string;
};

const MAX_PHOTOS = 5;

const RAW_API_URL = import.meta.env.VITE_API_URL as string;
const BASE_URL = RAW_API_URL.endsWith("/api")
  ? RAW_API_URL.slice(0, -4)
  : RAW_API_URL;

function toImgSrc(url: string) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

export default function ItemCollexCard({
  id,
  title,
  coverPhotoUrl,
  acquiredDate,
  to,
}: ItemCollexCardProps) {
  const linkTo = to ?? `/items/${id}`;

  const [photos, setPhotos] = useState<ItemPhotoDTO[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const run = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/items/${id}/photos`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          setPhotos([]);
          return;
        }

        const data: ItemPhotoDTO[] = await res.json();
        const safe = Array.isArray(data) ? data.slice(0, MAX_PHOTOS) : [];
        setPhotos(safe);

        const primaryIndex = safe.findIndex((p) => p.is_primary === 1);
        setIndex(primaryIndex >= 0 ? primaryIndex : 0);
      } catch {
        setPhotos([]);
      }
    };

    run();

    return () => controller.abort();
  }, [id]);

  const urls = useMemo(() => {
    if (photos.length > 0) return photos.map((p) => p.url);
    return coverPhotoUrl ? [coverPhotoUrl] : [];
  }, [photos, coverPhotoUrl]);

  const hasSlider = urls.length > 1;

  const currentUrl = urls[index] ?? "";
  const imgSrc = currentUrl ? toImgSrc(currentUrl) : "";

  const goPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((prev) => (prev - 1 + urls.length) % urls.length);
  };

  const goNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((prev) => (prev + 1) % urls.length);
  };

  return (
    <Link to={linkTo} className="itemcollex">
      <div className="itemcollex__media">
        {imgSrc ? (
          <>
            <img
              className="itemcollex__img"
              src={imgSrc}
              alt={title}
              loading="lazy"
            />

            {hasSlider && (
              <>
                <button
                  type="button"
                  className="itemcollex__nav itemcollex__nav--left"
                  aria-label="Photo précédente"
                  onClick={goPrev}
                >
                  ‹
                </button>

                <button
                  type="button"
                  className="itemcollex__nav itemcollex__nav--right"
                  aria-label="Photo suivante"
                  onClick={goNext}
                >
                  ›
                </button>

                <div className="itemcollex__dots">
                  {photos.map((p, i) => (
                    <span
                      key={p.id}
                      className={`itemcollex__dot ${i === index ? "is-active" : ""}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
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

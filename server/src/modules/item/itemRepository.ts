import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";

export type Item = {
  id: number;
  collection_id: number;
  title: string;
  cover_photo_url: string | null;
  acquired_date: string | null;
  description: string | null;
};

// CREATE
async function create(item: Pick<Item, "collection_id" | "title">) {
  const [result] = await databaseClient.query<Result>(
    "INSERT INTO items (collection_id, title) VALUES (?, ?)",
    [item.collection_id, item.title],
  );

  return result.insertId;
}

// READ ONE
async function read(id: number) {
  const [rows] = await databaseClient.query<Rows>(
    "SELECT * FROM items WHERE id = ?",
    [id],
  );

  return rows[0] as Item | undefined;
}

// READ ALL
async function readAll() {
  const [rows] = await databaseClient.query<Rows>("SELECT * FROM items");
  return rows as Item[];
}

// UPDATE (sans cover_photo_url)
async function update(
  itemId: number,
  payload: { title: string; description: string | null },
) {
  await databaseClient.query<Result>(
    "UPDATE items SET title = ?, description = ? WHERE id = ?",
    [payload.title, payload.description, itemId],
  );
}

// UPDATE cover_photo_url
async function updateCoverPhoto(itemId: number, photoUrl: string | null) {
  await databaseClient.query<Result>(
    "UPDATE items SET cover_photo_url = ? WHERE id = ?",
    [photoUrl, itemId],
  );
}

// DELETE
async function deleteItem(itemId: number) {
  await databaseClient.query<Result>("DELETE FROM items WHERE id = ?", [
    itemId,
  ]);
}

export default {
  create,
  read,
  readAll,
  update,
  updateCoverPhoto,
  delete: deleteItem,
};

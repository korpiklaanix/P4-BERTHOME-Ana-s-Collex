import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";

export type ItemPhoto = {
  id: number;
  item_id: number;
  url: string;
  is_primary: 0 | 1;
  created_at: string;
};

class ItemPhotosRepository {
  async listByItemId(itemId: number) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT * FROM item_photos WHERE item_id = ? ORDER BY is_primary DESC, id ASC",
      [itemId],
    );
    return rows as ItemPhoto[];
  }

  async countByItemId(itemId: number) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT COUNT(*) as count FROM item_photos WHERE item_id = ?",
      [itemId],
    );
    return Number((rows[0] as { count: number }).count);
  }

  async addMany(itemId: number, urls: string[]) {
    if (urls.length === 0) return;

    const values = urls.map((url) => [itemId, url, 0]);

    await databaseClient.query<Result>(
      "INSERT INTO item_photos (item_id, url, is_primary) VALUES ?",
      [values],
    );
  }

  async setPrimary(itemId: number, photoId: number) {
    await databaseClient.query(
      "UPDATE item_photos SET is_primary = 0 WHERE item_id = ?",
      [itemId],
    );

    await databaseClient.query(
      "UPDATE item_photos SET is_primary = 1 WHERE id = ? AND item_id = ?",
      [photoId, itemId],
    );
  }

  async getById(itemId: number, photoId: number) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT * FROM item_photos WHERE id = ? AND item_id = ?",
      [photoId, itemId],
    );
    return rows[0] as ItemPhoto | undefined;
  }

  async delete(itemId: number, photoId: number) {
    await databaseClient.query(
      "DELETE FROM item_photos WHERE id = ? AND item_id = ?",
      [photoId, itemId],
    );
  }
}

export default new ItemPhotosRepository();

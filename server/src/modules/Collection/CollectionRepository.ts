import type { ResultSetHeader, RowDataPacket } from "mysql2";
import databaseClient from "../../../database/client";

export type Collection = {
  id: number;
  name: string;
  category_label: string;
};

type CollectionDetailsRow = RowDataPacket & {
  id: number;
  name: string;
  description: string | null;
  category_label: string;
};

type CollectionRow = RowDataPacket & Collection;

export const CollectionRepository = {
  // récupérer toutes les collections d’un user
  async findAllByUserId(userId: number): Promise<Collection[]> {
    const [rows] = await databaseClient.query<CollectionRow[]>(
      `
      SELECT
        c.id,
        c.name,
        cat.label AS category_label
      FROM collections c
      JOIN categories cat ON cat.id = c.category_id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
      `,
      [userId],
    );

    return rows;
  },

  // créer une collection
  async create(
    userId: number,
    name: string,
    categoryId: number,
    description: string | null,
  ): Promise<ResultSetHeader> {
    const [result] = await databaseClient.query<ResultSetHeader>(
      `
      INSERT INTO collections (user_id, category_id, name, description)
      VALUES (?, ?, ?, ?)
      `,
      [userId, categoryId, name, description],
    );

    return result;
  },

  // supprimer une collection
  async delete(collectionId: number, userId: number) {
    const [result] = await databaseClient.query<ResultSetHeader>(
      `
      DELETE FROM collections
      WHERE id = ? AND user_id = ?
      `,
      [collectionId, userId],
    );

    return result;
  },

  // update une collection
  async update(id: number, userId: number, name: string, categoryId: number) {
    const [result] = await databaseClient.query(
      `
    UPDATE collections
    SET name = ?, category_id = ?
    WHERE id = ? AND user_id = ?
    `,
      [name, categoryId, id, userId],
    );

    return result;
  },
  async findById(id: number, userId: number) {
    const [rows] = await databaseClient.query<CollectionDetailsRow[]>(
      `
    SELECT
      c.id,
      c.name,
      c.description,
      cat.label AS category_label
    FROM collections c
    JOIN categories cat ON cat.id = c.category_id
    WHERE c.id = ? AND c.user_id = ?
    `,
      [id, userId],
    );

    return rows[0] ?? null;
  },
};

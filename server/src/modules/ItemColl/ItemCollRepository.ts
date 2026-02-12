import type { ResultSetHeader, RowDataPacket } from "mysql2";
import databaseClient from "../../../database/client";

export type ItemColl = {
  id: number;
  title: string;
  cover_photo_url: string | null;
  acquired_date: string | null;
};

export type ItemCollDetails = {
  id: number;
  collection_id: number;
  title: string;
  cover_photo_url: string | null;
  acquired_date: string | null;
  description: string | null;
};

type ItemCollRow = RowDataPacket & ItemColl;
type ItemCollDetailsRow = RowDataPacket & ItemCollDetails;

export const ItemCollRepository = {
  async findAllByCollectionId(
    collectionId: number,
    userId: number,
  ): Promise<ItemColl[]> {
    const [rows] = await databaseClient.query<ItemCollRow[]>(
      `
      SELECT
        i.id,
        i.title,
        i.cover_photo_url,
        i.acquired_date
      FROM items i
      JOIN collections c ON c.id = i.collection_id
      WHERE i.collection_id = ? AND c.user_id = ?
      ORDER BY i.created_at DESC
      `,
      [collectionId, userId],
    );

    return rows;
  },

  async create(
    collectionId: number,
    userId: number,
    title: string,
    coverPhotoUrl: string | null,
  ) {
    const [result] = await databaseClient.query(
      `
    INSERT INTO items (collection_id, title, cover_photo_url)
    SELECT ?, ?, ?
    FROM collections
    WHERE id = ? AND user_id = ?
    `,
      [collectionId, title, coverPhotoUrl, collectionId, userId],
    );

    return result as ResultSetHeader;
  },

  async findById(
    itemId: number,
    userId: number,
  ): Promise<ItemCollDetails | null> {
    const [rows] = await databaseClient.query<ItemCollDetailsRow[]>(
      `
      SELECT
        i.id,
        i.collection_id,
        i.title,
        i.cover_photo_url,
        i.acquired_date,
        i.description
      FROM items i
      JOIN collections c ON c.id = i.collection_id
      WHERE i.id = ? AND c.user_id = ?
      `,
      [itemId, userId],
    );

    return rows[0] ?? null;
  },

  async update(
    itemId: number,
    userId: number,
    title: string,
    description: string | null,
  ): Promise<ResultSetHeader> {
    const [result] = await databaseClient.query(
      `
    UPDATE items i
    JOIN collections c ON c.id = i.collection_id
    SET i.title = ?, i.description = ?
    WHERE i.id = ? AND c.user_id = ?
    `,
      [title, description, itemId, userId],
    );

    return result as ResultSetHeader;
  },

  async delete(itemId: number, userId: number): Promise<ResultSetHeader> {
    const [result] = await databaseClient.query(
      `
      DELETE i
      FROM items i
      JOIN collections c ON c.id = i.collection_id
      WHERE i.id = ? AND c.user_id = ?
      `,
      [itemId, userId],
    );

    return result as ResultSetHeader;
  },

  async updateCoverPhoto(
    itemId: number,
    userId: number,
    coverPhotoUrl: string | null,
  ): Promise<ResultSetHeader> {
    const [result] = await databaseClient.query(
      `
    UPDATE items i
    JOIN collections c ON c.id = i.collection_id
    SET i.cover_photo_url = ?
    WHERE i.id = ? AND c.user_id = ?
    `,
      [coverPhotoUrl, itemId, userId],
    );

    return result as ResultSetHeader;
  },
};

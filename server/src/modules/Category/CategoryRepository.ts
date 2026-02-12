import type { RowDataPacket } from "mysql2";
import databaseClient from "../../../database/client";

export type Category = {
  id: number;
  label: string;
};

type CategoryRow = RowDataPacket & Category;

export const CategoryRepository = {
  async findAll(): Promise<Category[]> {
    const [rows] = await databaseClient.query<CategoryRow[]>(
      `
      SELECT id, label
      FROM categories
      ORDER BY label ASC
      `,
    );

    return rows;
  },
};

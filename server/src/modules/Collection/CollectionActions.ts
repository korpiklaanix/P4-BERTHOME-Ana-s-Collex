import type { RequestHandler } from "express";
import { CollectionRepository } from "./CollectionRepository";

// ⚠️ MVP : user simulé
const FAKE_USER_ID = 1;

// GET /api/collections
export const getCollections: RequestHandler = async (req, res) => {
  const collections = await CollectionRepository.findAllByUserId(FAKE_USER_ID);

  res.json(collections);
};

// POST /api/collections

export const createCollection: RequestHandler = async (req, res) => {
  try {
    const { name, category_id, description } = req.body;

    // 👀 debug : tu verras ce que le front envoie
    console.log("POST /api/collections body:", req.body);

    if (!name || typeof name !== "string" || !name.trim()) {
      res.status(400).json({ message: "name is required" });
      return;
    }

    const categoryIdNumber = Number(category_id);
    if (Number.isNaN(categoryIdNumber)) {
      res.status(400).json({ message: "category_id is required" });
      return;
    }

    const result = await CollectionRepository.create(
      FAKE_USER_ID,
      name.trim(),
      categoryIdNumber,
      description ?? null,
    );

    res.status(201).json({ message: "created", id: result.insertId });
  } catch (err: unknown) {
    console.error("CREATE COLLECTION ERROR:", err);

    // helpers de narrowing
    const isRecord = (v: unknown): v is Record<string, unknown> =>
      typeof v === "object" && v !== null;

    let code: string | undefined;
    let sqlMessage: string | undefined;

    if (isRecord(err)) {
      if (typeof err.code === "string") code = err.code;
      if (typeof err.sqlMessage === "string") sqlMessage = err.sqlMessage;
    }

    res.status(500).json({
      message: code ?? "server error",
      detail: sqlMessage ?? (err instanceof Error ? err.message : String(err)),
    });
  }
};

// DELETE /api/collections/:id
export const deleteCollection: RequestHandler = async (req, res) => {
  const collectionId = Number(req.params.id);

  if (Number.isNaN(collectionId)) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }

  await CollectionRepository.delete(collectionId, FAKE_USER_ID);

  res.sendStatus(204);
};
// UPDATE /api/collections/:id

export const updateCollection: RequestHandler = async (req, res) => {
  const id = Number(req.params.id);
  const { name, category_id } = req.body;

  if (Number.isNaN(id)) {
    res.status(400).json({ message: "invalid id" });
    return;
  }

  if (!name || !category_id) {
    res.status(400).json({ message: "missing fields" });
    return;
  }

  await CollectionRepository.update(
    id,
    FAKE_USER_ID,
    name.trim(),
    Number(category_id),
  );

  res.json({ message: "updated" });
};

export const getCollectionById: RequestHandler = async (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ message: "invalid id" });
    return;
  }

  const data = await CollectionRepository.findById(id, FAKE_USER_ID);

  if (!data) {
    res.status(404).json({ message: "not found" });
    return;
  }

  res.json(data);
};

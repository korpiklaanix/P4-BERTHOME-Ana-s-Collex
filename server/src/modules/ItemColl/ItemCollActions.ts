import type { RequestHandler } from "express";
import { ItemCollRepository } from "./ItemCollRepository";

const FAKE_USER_ID = 1;

export const browseByCollection: RequestHandler = async (req, res) => {
  const collectionId = Number(req.params.id);

  if (Number.isNaN(collectionId)) {
    res.status(400).json({ message: "invalid id" });
    return;
  }

  const items = await ItemCollRepository.findAllByCollectionId(
    collectionId,
    FAKE_USER_ID,
  );

  res.json(items);
};

export const addItem: RequestHandler = async (req, res) => {
  const collectionId = Number(req.params.id);
  const { title, cover_photo_url } = req.body;

  if (!title) {
    res.status(400).json({ message: "title required" });
    return;
  }

  const result = await ItemCollRepository.create(
    collectionId,
    FAKE_USER_ID,
    title.trim(),
    cover_photo_url ?? null,
  );

  res.status(201).json({ id: result.insertId });
};

export const readItem: RequestHandler = async (req, res) => {
  const itemId = Number(req.params.id);

  if (Number.isNaN(itemId)) {
    res.status(400).json({ message: "invalid id" });
    return;
  }

  const item = await ItemCollRepository.findById(itemId, FAKE_USER_ID);

  if (!item) {
    res.status(404).json({ message: "not found" });
    return;
  }

  res.json(item);
};

export const updateItem: RequestHandler = async (req, res) => {
  const itemId = Number(req.params.id);
  const { title, cover_photo_url, description } = req.body;

  if (Number.isNaN(itemId)) {
    res.status(400).json({ message: "invalid id" });
    return;
  }

  if (!title || typeof title !== "string" || !title.trim()) {
    res.status(400).json({ message: "title required" });
    return;
  }

  const result = await ItemCollRepository.update(
    itemId,
    FAKE_USER_ID,
    title.trim(),
    cover_photo_url ?? null,
    description ?? null,
  );

  if (result.affectedRows === 0) {
    res.status(404).json({ message: "not found" });
    return;
  }

  res.json({ message: "updated" });
};

export const deleteItem: RequestHandler = async (req, res) => {
  const itemId = Number(req.params.id);

  if (Number.isNaN(itemId)) {
    res.status(400).json({ message: "invalid id" });
    return;
  }

  const result = await ItemCollRepository.delete(itemId, FAKE_USER_ID);

  if (result.affectedRows === 0) {
    res.status(404).json({ message: "not found" });
    return;
  }

  res.sendStatus(204);
};

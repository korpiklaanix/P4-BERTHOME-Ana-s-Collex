import type { RequestHandler } from "express";
import { ItemCollRepository } from "../ItemColl/ItemCollRepository";
import itemPhotosRepository from "./itemPhotosRepository";

const FAKE_USER_ID = 1;
const MAX_PHOTOS = 5;

const toId = (value: unknown) => Number(value);
const isValidId = (n: number) => Number.isFinite(n) && n > 0;

async function ensureItemExistsForUser(itemId: number) {
  const item = await ItemCollRepository.findById(itemId, FAKE_USER_ID);
  return item;
}

const listPhotos: RequestHandler = async (req, res, next) => {
  try {
    const itemId = toId(req.params.id);
    if (!isValidId(itemId)) {
      res.status(400).json({ message: "invalid id" });
      return;
    }

    const item = await ensureItemExistsForUser(itemId);
    if (!item) {
      res.status(404).json({ message: "item not found" });
      return;
    }

    const photos = await itemPhotosRepository.listByItemId(itemId);
    res.json(photos);
  } catch (err) {
    next(err);
  }
};

const uploadPhoto: RequestHandler = async (req, res, next) => {
  try {
    const itemId = toId(req.params.id);
    if (!isValidId(itemId)) {
      res.status(400).json({ message: "invalid id" });
      return;
    }

    const item = await ensureItemExistsForUser(itemId);
    if (!item) {
      res.status(404).json({ message: "item not found" });
      return;
    }

    const file = req.file as Express.Multer.File | undefined;
    if (!file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const existingCount = await itemPhotosRepository.countByItemId(itemId);
    if (existingCount + 1 > MAX_PHOTOS) {
      res.status(400).json({ message: `Max ${MAX_PHOTOS} photos par item.` });
      return;
    }

    const url = `/uploads/items/${file.filename}`;
    await itemPhotosRepository.addMany(itemId, [url]);

    const photosAfter = await itemPhotosRepository.listByItemId(itemId);
    const primary = photosAfter.find((p) => p.is_primary === 1);

    if (!primary) {
      const newest = photosAfter[0]; //
    }

    res.status(201).json({ photoUrl: url });
  } catch (err) {
    next(err);
  }
};

const addPhotos: RequestHandler = async (req, res, next) => {
  try {
    const itemId = toId(req.params.id);
    if (!isValidId(itemId)) {
      res.status(400).json({ message: "invalid id" });
      return;
    }

    const item = await ensureItemExistsForUser(itemId);
    if (!item) {
      res.status(404).json({ message: "item not found" });
      return;
    }

    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      res.status(400).json({ message: "No files uploaded" });
      return;
    }

    const existingCount = await itemPhotosRepository.countByItemId(itemId);
    if (existingCount + files.length > MAX_PHOTOS) {
      res.status(400).json({ message: `Max ${MAX_PHOTOS} photos par item.` });
      return;
    }

    const urls = files.map((f) => `/uploads/items/${f.filename}`);
    await itemPhotosRepository.addMany(itemId, urls);

    const photosAfter = await itemPhotosRepository.listByItemId(itemId);
    const hasPrimary = photosAfter.some((p) => p.is_primary === 1);

    if (!hasPrimary && photosAfter[0]) {
      await itemPhotosRepository.setPrimary(itemId, photosAfter[0].id);
      await ItemCollRepository.updateCoverPhoto(
        itemId,
        FAKE_USER_ID,
        photosAfter[0].url,
      );
    }

    res.status(201).json({ message: "uploaded", urls });
  } catch (err) {
    next(err);
  }
};

const setPrimaryPhoto: RequestHandler = async (req, res, next) => {
  try {
    const itemId = toId(req.params.itemId);
    const photoId = toId(req.params.photoId);

    if (!isValidId(itemId) || !isValidId(photoId)) {
      res.status(400).json({ message: "invalid id" });
      return;
    }

    const item = await ensureItemExistsForUser(itemId);
    if (!item) {
      res.status(404).json({ message: "item not found" });
      return;
    }

    const photo = await itemPhotosRepository.getById(itemId, photoId);
    if (!photo) {
      res.status(404).json({ message: "photo not found" });
      return;
    }

    await itemPhotosRepository.setPrimary(itemId, photoId);
    await ItemCollRepository.updateCoverPhoto(itemId, FAKE_USER_ID, photo.url);

    res.json({ message: "primary updated", cover_photo_url: photo.url });
  } catch (err) {
    next(err);
  }
};

const deletePhoto: RequestHandler = async (req, res, next) => {
  try {
    const itemId = toId(req.params.itemId);
    const photoId = toId(req.params.photoId);

    if (!isValidId(itemId) || !isValidId(photoId)) {
      res.status(400).json({ message: "invalid id" });
      return;
    }

    const item = await ensureItemExistsForUser(itemId);
    if (!item) {
      res.status(404).json({ message: "item not found" });
      return;
    }

    const photo = await itemPhotosRepository.getById(itemId, photoId);
    if (!photo) {
      res.status(404).json({ message: "photo not found" });
      return;
    }

    await itemPhotosRepository.delete(itemId, photoId);

    if (photo.is_primary === 1) {
      const photosAfter = await itemPhotosRepository.listByItemId(itemId);
      const nextPrimary = photosAfter[0] ?? null;

      if (nextPrimary) {
        await itemPhotosRepository.setPrimary(itemId, nextPrimary.id);
        await ItemCollRepository.updateCoverPhoto(
          itemId,
          FAKE_USER_ID,
          nextPrimary.url,
        );
      } else {
        await ItemCollRepository.updateCoverPhoto(itemId, FAKE_USER_ID, null);
      }
    }

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

export default {
  listPhotos,
  uploadPhoto,
  addPhotos,
  setPrimaryPhoto,
  deletePhoto,
};

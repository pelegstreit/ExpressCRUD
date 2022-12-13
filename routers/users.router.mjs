import { Router } from "express";
import log from "@ajar/marker";
import { uuid } from "uuidv4";
import fs from "fs/promises";
import path from "path";

const DB_PATH = path.resolve("./db/db.json");
// const DB_PATH = '../db/db.json';

const router = Router();

async function getUsers(req, res, next) {
  // read users array from file
  const content = await fs.readFile(DB_PATH, "utf8");
  req.users = JSON.parse(content);
  next();
}
router.use(getUsers);

//CREATE USER
router.post("/", async (req, res) => {
  // log.obj(req.body,'req.body:')
  console.log("req.body " + req.body);
  // push new user
  req.users.push({ ...req.body, id: uuid() });
  // save the file
  await fs.writeFile(DB_PATH, JSON.stringify(req.users, null, 2));
  res.status(200).send(`create user ${uuid()}`);
});

//GET ALL USERS
router.get("/", async (req, res, next) => {
  try {
    res.status(200).json(req.users);
  } catch (err) {
    next(err);
  }
});

//GET USER BY ID
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.users.find((user) => user.id === id);
    res.status(200).send(user);
  } catch (err) {
    next(err);
  }
});

//UPDATE USER
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    // const userIndex = req.users.findIndex((user) => user.id === id);
    const updatedUsers = req.users.map((user) =>
      user.id === id ? req.body : user
    );
    await fs.writeFile(DB_PATH, JSON.stringify(updatedUsers, null, 2));
    res.status(200).send(`user ${id} updated successfully`);
  } catch (err) {
    next(err);
  }
});

//UPDATE USER
router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    res.status(200).send(`update merge user field ${id}`);
  } catch (err) {
    next(err);
  }
});

//DELETE USER
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedUsers = req.users.filter(user => user.id !== id);
    // TODO: implement delete with findIndex and splice...
    await fs.writeFile(DB_PATH, JSON.stringify(updatedUsers, null, 2));
    res.status(200).send(`user ${id} deleted successfully`);
  } catch (err) {
    next(err);
  }
});

export default router;

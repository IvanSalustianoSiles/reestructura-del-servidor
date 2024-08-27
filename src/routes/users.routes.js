import { Router } from "express";
import { UserMDBManager } from "../controllers/index.js";
import { verifyMDBID } from "../services/index.js";
import config from "../config.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const users = await UserMDBManager.paginateUsers(
      { role: "user" },
      { page: 1, limit: 10 }
    );
    res.send({ status: 1, payload: users || "Lo sentimos, ha ocurrido un error al intentar recibir los usuarios." });
  } catch (error){
    res.status(500).send({
      origin: config.SERVER,
      error: `[ERROR: ${error}]`
    });
  }
});
router.post("/", async (req, res) => {
  try {
    const process = await UserMDBManager.addUser(req.body);
    res.status(200).send({ status: 1, payload: process || "Lo sentimos, ha ocurrido un error al cargar el usuario." });
  } catch (error) {
    res.status(500).send({
      error: `[ERROR: ${error}]`,
    });
  }
});
router.put("/:id", verifyMDBID(["id"]), async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    const update = req.body;
    const options = { new: true };
    const process = await UserMDBManager.updateUser(filter, update, options);
    res.status(200).send({ origin: config.SERVER, payload: process || "Error de base de datos. Estamos trabajando en ello" });
  } catch (error) {
    res.status(500).send({
      origin: config.SERVER,
      error: `[ERROR: ${error}]`
    });
  }
});
router.delete("/:id", verifyMDBID(["id"]), async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    const process = await UserMDBManager.deleteUser(filter);
    res.status(200).send({ origin: config.SERVER, payload: process || "Lo sentimos, ha ocurrido un error al intentar eliminar el usuario." });
  } catch (error) {
    res.status(500).send({
      origin: config.SERVER,
      error: `[ERROR: ${error}]`,
    });
  }
});
export default router;

import { Router } from "express";
import { uploader } from "../services/index.js";
import { ProductMDBManager, ProductManagerFS } from "../controllers/index.js";
import { verifyMDBID, catchCall } from "../services/index.js";
import config from "../config.js";

let toSendObject = {};
const router = Router();

// Routes

router.get("/", async (req, res) => {
  try {
    toSendObject = await ProductMDBManager.getAllProducts(
      req.query.limit,
      req.query.page,
      req.query.query,
      req.query.sort,
      req.query.available,
      "/api/products"
    );
    res.send(toSendObject);
  } catch (error) {
    res.status(400).send({ origin: config.SERVER, error: `[ERROR: ${error}]`});
  }
});
router.get("/:pid", verifyMDBID(["pid"]), async (req, res) => {
  try {
      toSendObject = await ProductMDBManager.getProductById(req.params.pid);
      res.status(200).send(toSendObject);
  } catch (error) {
    res.status(400).send({ origin: config.SERVER, error: `[ERROR: ${error}]`});
  }
});
router.post("/", uploader.single("thumbnail"), async (req, res) => {
  try {
    toSendObject = await ProductMDBManager.addProducts({
      ...req.body,
      thumbnail: req.file.filename,
      status: true,
    });
    let addedProduct = toSendObject.find(
      (product) => (product.title == req.body.title)
    );
    let pid = JSON.parse(JSON.stringify(addedProduct._id)).replace(/"/g, "");
    ProductManagerFS.addProduct({
      ...req.body,
      thumbnail: req.file.filename,
      status: true,
      mdbid: pid,
    });
    res.send(toSendObject);
    
  } catch (error) {
    res.status(400).send({ origin: config.SERVER, error: `[ERROR: ${error}]`});
  }
});
router.put("/:pid", verifyMDBID(["pid"]), async (req, res) => {
  try {
    const { pid } = req.params;
    toSendObject = await ProductMDBManager.updateProductById(pid, req.body);
    ProductManagerFS.updateProduct(pid, req.body);
    res.send(toSendObject);
  } catch (error) {
    res.status(400).send({ origin: config.SERVER, error: `[ERROR: ${error}]`});
  }
});
router.delete("/:pid", verifyMDBID(["pid"]), async (req, res) => {
  try {
    const { pid } = req.params;
    toSendObject = await ProductMDBManager.deleteProductById(pid);
    ProductManagerFS.deleteProductById(pid);
    res.send(toSendObject);
  } catch (error) {
    res.status(400).send({ origin: config.SERVER, error: `[ERROR: ${error}]`});
  }
});
catchCall(router, "productos");

export default router;

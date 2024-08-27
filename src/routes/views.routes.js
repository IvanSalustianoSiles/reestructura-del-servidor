import { Router } from "express";
import { uploader } from "../services/index.js";
import { verifyMDBID } from "../services/index.js";
import config from "../config.js";
import {
  CartMDBManager,
  ProductMDBManager,
  ProductManagerFS,
  UserMDBManager,
} from "../controllers/index.js";

let toSendObject = {};
const router = Router();

router.get("/welcome", (req, res) => {
  const user = {
    name: "Iván",
    surname: "Siles",
  };
  UserMDBManager.isRegistered("index", user, req, res);
});
router.get("/products", async (req, res) => {
  let paginated = await ProductMDBManager.getAllProducts(
    req.query.limit,
    req.query.page,
    req.query.query,
    req.query.sort,
    req.query.available,
    "/products"
  );
  let toSendArray = paginated.payload.docs.map((product, index) => {
    const {
      title,
      description,
      price,
      code,
      stock,
      category,
      status,
      thumbnail,
    } = product;
    const parsedId = JSON.stringify(paginated.payload.docs[index]._id);
    return {
      _id: parsedId.replace(/"/g, ""),
      title: title,
      description: description,
      price: price,
      code: code,
      stock: stock,
      category: category,
      status: status,
      thumbnail: thumbnail,
    };
  });
  let toSendObject = { ...paginated };
  !toSendObject.nextLink
    ? (toSendObject["nextLink"] = "undefined")
    : toSendObject.nextLink;
  !toSendObject.prevLink
    ? (toSendObject["prevLink"] = "undefined")
    : toSendObject.prevLink;
  Object.values(toSendObject.payload).forEach((payloadValue, index) => {
    let payloadKey = Object.keys(toSendObject.payload)[index];
    if (!payloadValue) {
      toSendObject.payload[payloadKey] = "x";
    }
  });
  UserMDBManager.isRegistered(
    "home",
    {
      toSendArray: toSendArray,
      toSendObject: toSendObject,
      ...req.session.user,
    },
    req,
    res
  );
});
router.post("/products", async (req, res) => {
  const { add, ID } = req.body;
  if (add) {
    await CartMDBManager.createCartMDB().then((res) => {
      CartMDBManager.addProductMDB(ID, JSON.parse(JSON.stringify(res.ID)));
    });
  }
});
router.get("/carts/:cid", verifyMDBID(["cid"]), async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await CartMDBManager.getCartById(cid);
    const toSendObject = await CartMDBManager.getProductsOfACard(cart);
    UserMDBManager.isRegistered("cart", { toSendObject: toSendObject }, req, res);
  } catch (error) {
    res.status(400).send({origin: config.SERVER, error: `[ERROR: ${error}]`})
  }
});
router.get("/realtimeproducts", (req, res) => {
  toSendObject = ProductManagerFS.readFileAndSave();
  UserMDBManager.isRegistered(
    "realTimeProducts",
    { toSendObject: toSendObject },
    req,
    res
  );
});
router.post("/realtimeproducts", uploader.single("archivo"), (req, res) => {
  const socketServer = req.app.get("socketServer");
  const { newProduct, productAction } = JSON.parse(req.body.json);
  const { id } = newProduct;
  if (productAction == "add") {
    let toAddProduct = {
      ...newProduct,
      thumbnail: req.file.filename,
      status: true,
    };
    ProductManagerFS.addProduct(toAddProduct);
    let toAddId =
      ProductManagerFS.readFileAndSave()[
        ProductManagerFS.readFileAndSave().length - 1
      ]._id;
    socketServer.emit("addConfirmed", { msg: "Producto agregado.", toAddId });
  } else if (productAction == "delete") {
    ProductManagerFS.deleteProductById(id);

    socketServer.emit("deleteConfirmed", {
      msg: `Producto de ID ${id} eliminado.`,
      pid: id,
    });
  }
  res.render("realTimeProducts", { toSendObject: toSendObject });
});
router.get("/chat", (req, res) => {
  UserMDBManager.isRegistered("chat", {}, req, res);
});
router.get("/login", (req, res) => {
  !req.session.user ? res.render("login", { postAction: "/api/auth/login", hrefReg: "/register", showError: req.query.error ? true : false, errorMessage: req.query.error }) : res.redirect("/profile");
});
router.get("/register", (req, res) => {
  !req.session.user
  ? res.render("register", { postAction: "/api/auth/register", hrefLog: "/login", showError: req.query.error ? true : false, errorMessage: req.query.error })
  : res.send("Ya has ingresado.");
});
router.get("/pplogin", (req, res) => {
  !req.session.user ? res.render("login", { postAction: "/api/auth/pplogin", hrefReg: "/ppregister", showError: req.query.error ? true : false, errorMessage: req.query.error }) : res.redirect("/profile");
});
router.get("/ppregister", (req, res) => {
  !req.session.user
  ? res.render("register", { postAction: "/api/auth/ppregister", hrefLog: "/pplogin", showError: req.query.error ? true : false, errorMessage: req.query.error })
  : res.send("Ya has ingresado.");
});
router.get("/profile", (req, res) => {
  UserMDBManager.isRegistered("profile", { user: req.session.user }, req, res);
});
router.get("/jwtlogin", (req, res) => {
  !(req.cookies[`${config.APP_NAME}_cookie`] && req.cookies) 
  ? res.render("login", { postAction: "/api/auth/jwtlogin", hrefReg: "/jwtregister", showError: req.query.error ? true : false, errorMessage: req.query.error }) 
  : res.redirect("/jwtprofile");
});
router.get("/jwtregister", (req, res) => {
  !(req.cookies[`${config.APP_NAME}_cookie`] && req.cookies)
  ? res.render("register", { postAction: "/api/auth/jwtregister", hrefLog: "/jwtlogin", showError: req.query.error ? true : false, errorMessage: req.query.error })
  : res.redirect("/jwtprofile");
});
router.get("/jwtprofile", (req, res) => {
  let myUser = req.cookies[`${config.SECRET}_cookie`];
  UserMDBManager.isRegisteredwToken("profile", { user: myUser }, req, res);
});


export default router;

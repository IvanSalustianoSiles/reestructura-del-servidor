import fs from "fs";
import { myCarts, myProducts } from "../mocks/index.js";

// Clase para controlar los métodos referentes a los carritos.
class CartManager {
  constructor() {
    this.cartsArray = [];
    this.path = `./../jsons/cart.json`;
    this.getting = false;
  }
  createCart(mdbid) {
    this.readFileAndSave();

    let newCart = {
      _id: mdbid,
      products: [],
    };

    this.cartsArray.push(newCart);
    this.updateFile(this.cartsArray);
    console.log(`El carrito de ID "${newCart._id}" fue agregado.`);

    return newCart;
  }
  addProduct(id, cid) {
    this.readFileAndSave();
    let newProduct = {
      id: id,
      quantity: 1,
    };
    if (!Object.values(newProduct).includes(undefined)) {
      let myCart = this.cartsArray.find((cart) => cart._id == cid);
      if (myCart) {
        let myProduct = myCart["products"].find((product) => product._id == id);
        if (myProduct) {
          let indexOfProd = myCart["products"].indexOf(myProduct);
          newProduct["quantity"] = myProduct["quantity"] + newProduct.quantity;
          myCart["products"].splice(indexOfProd, 1);
          myCart["products"].push(newProduct);
          console.log(
            `Ahora hay ${myProduct["quantity"]} productos de ID ${id} en el carrito de ID ${cid}.`
          );
        } else {
          console.log(`Producto de ID ${id} agregado.`);
          myCart["products"].push(newProduct);
        }
        this.updateFile(this.cartsArray);
        return myCart;
      } else {
        console.log(`El carrito de ID ${cid} no fue encontrado.`);
      }
    } else {
      console.log(
        `El producto que intentabas ingresar no contiene las propiedades adecuadas.`
      );
    }
  }
  getProdsOfCartById(cid) {
    this.getting = true;
    this.readFileAndSave();
    let gottenCart = this.cartsArray.find((cart) => cart._id == cid);
    if (gottenCart) {
      return gottenCart["products"];
    } else {
      console.log(`No se encontró el carrito que coincida con la id "${cid}".`);
    }
    this.getting = false;
  }
  updateFile(array) {
    fs.writeFileSync(`${this.path}`, JSON.stringify(array));
  }
  readFileAndSave() {
    if (fs.existsSync(this.path)) {
      let fileContent = fs.readFileSync(this.path, "utf-8");
      let parsedFileContent = JSON.parse(fileContent);
      this.cartsArray = parsedFileContent;
    } else if (this.getting) {
      console.log("ERROR: El archivo que intentas leer no existe.");
    }
    return this.cartsArray;
  }
};

// Carritos y productos de ejemplo para agregar y probar el algoritmo.
const [cart1, cart2, cart3, cart4] = myCarts;
const [product1, product2, product3, productCambiado] = myProducts;

// Métodos a utilizar:

// Para productos:
// exampleProductManager.addProduct();
// exampleProductManager.getProducts();
// exampleProductManager.getProductById();
// exampleProductManager.deleteProductById();
// exampleProductManager.updateProduct();
// exampleProductManager.readFileAndSave();

// Para carritos:
// exampleCartManager.createCart();
// exampleCartManager.getProdsOfCartById();
// exampleCartManager.addProduct();
// exampleCartManager.updateFile();
// exampleCartManager.readFileAndSave();

// CartManager de ejemplo para probar el algoritmo.

const CartManagerFS = new CartManager();

export default CartManagerFS;

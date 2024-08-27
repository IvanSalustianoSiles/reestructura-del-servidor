import fs from "fs";
import { myProducts } from "../mocks/index.js";

// Clase para controlar los métodos referentes a los productos.
class ProductManager {
  constructor() {
    this.productsArray = [];
    this.path = `./../jsons/product.json`;
    this.getting = false;
  }
  addProduct({
    title,
    description,
    price,
    code,
    stock,
    category,
    status,
    thumbnail,
    mdbid,
  }) {
    this.readFileAndSave();
    let newProduct = {
      title: title,
      description: description,
      price: price,
      code: code,
      stock: stock,
      category: category,
      status: status,
      thumbnail: thumbnail,
      _id: mdbid,
    };

    let codeExists = this.productsArray.some(
      (product) => product.code == newProduct.code
    );

    if (codeExists == false && !Object.keys(newProduct).includes(undefined)) {
      // Validamos que no se repita el code y que los campos sean obligatorios.

      this.productsArray.push(newProduct);
      this.updateFile(this.productsArray);
      console.log(`El producto de ID "${newProduct._id}" fue agregado.`);
    }
  }
  getProducts() {
    this.getting = true;
    this.readFileAndSave();
    if (this.productsArray.length != 0) {
      console.log(this.productsArray);
    } else {
      console.log("Su array está vacío.");
    }
    this.getting = false;
  }
  getProductById(id) {
    this.getting = true;
    this.readFileAndSave();
    let gottenProduct = this.productsArray.find((product) => product._id == id);
    if (gottenProduct) {
      return gottenProduct;
    } else {
      console.log(`No se encontró el producto que coincida con la id "${id}".`);
    }
    this.getting = false;
  }
  deleteProductById(id) {
    this.readFileAndSave();
    let toDeleteProduct = this.productsArray.find(
      (product) => product._id == id
    );
    if (toDeleteProduct) {
      const forDeleteIndex = this.productsArray.indexOf(toDeleteProduct);
      this.productsArray.splice(forDeleteIndex, 1);
      this.updateFile(this.productsArray);
      console.log(`Producto "${toDeleteProduct.title}" eliminado.`);
    } else {
      console.log(`No se encontró el producto que coincida con la ID "${id}".`);
    }
  }
  updateProduct(id, latestProduct = {}) {
    this.readFileAndSave();
    let toUpdateProduct = this.productsArray.find(
      (product) => product._id == id
    );
    if (toUpdateProduct) {
      Object.values(toUpdateProduct).forEach((value, i) => {
        if (Object.values(latestProduct)[i] == "") {
          Object.values(latestProduct)[i] == value;
        }
      });
      latestProduct = { ...latestProduct, id: id };
      let indexToUpdate = this.productsArray.indexOf(toUpdateProduct);
      this.productsArray.splice(indexToUpdate, 1, latestProduct);
      this.updateFile(this.productsArray);
      console.log(`Producto de ID "${toUpdateProduct._id}" actualizado.`);
    } else {
      console.log(`No se encontró el producto que coincida con la ID "${id}".`);
    }
  }
  updateFile(array) {
    fs.writeFileSync(`${this.path}`, JSON.stringify(array));
  }
  readFileAndSave() {
    if (fs.existsSync(this.path)) {
      let fileContent = fs.readFileSync(this.path, "utf-8");
      let parsedFileContent = JSON.parse(fileContent);
      this.productsArray = parsedFileContent;
    } else if (this.getting) {
      console.log("ERROR: El archivo que intentas leer no existe.");
    }
    return this.productsArray;
  }
};

// Productos de ejemplo para agregar y probar el algoritmo.
const [product1, product2, product3, productCambiado] = myProducts;

// Métodos a utilizar:

// Para productos:
// exampleProductManager.addProduct();
// exampleProductManager.getProducts();
// exampleProductManager.getProductById();
// exampleProductManager.deleteProductById();
// exampleProductManager.updateProduct();
// exampleProductManager.readFileAndSave();

const ProductManagerFS = new ProductManager();

export default ProductManagerFS;

import { productsModel } from "../models/index.js";

class ProductMDBManagerClass {
  constructor(model) {
    this.products = [];
    this.model = model;
  }
  getAllProducts = async (limit, page, query, sort, available, where) => {
    let toSendObject = {};
    let prevUrl;
    let nextUrl;
    let paginateArray = [{}, { page: 1, limit: 10, sort: {} }];
    limit ? (paginateArray[1].limit = +limit) : paginateArray;
    page ? (paginateArray[1].page = +page) : paginateArray;
    sort == +sort ? (paginateArray[1].sort = { price: +sort }) : paginateArray;
    query ? (paginateArray[0] = { category: query }) : paginateArray;
    if (available == "true") {
      paginateArray[0] = { ...paginateArray[0], stock: { $gt: 0 } };
    } else if (available == "false") {
      paginateArray[0] = { ...paginateArray[0], stock: { $eq: 0 } };
    }
    this.products = await this.model.paginate(...paginateArray);
    if (query) {
      this.products.hasPrevPage
        ? (prevUrl = `${where}?query=${query}&page=${this.products.prevPage}&limit=${limit}&sort=${sort}&available=${available}`)
        : null;
      this.products.hasNextPage
        ? (nextUrl = `${where}?query=${query}&page=${this.products.nextPage}&limit=${limit}&sort=${sort}&available=${available}`)
        : null;
    } else {
      this.products.hasPrevPage
        ? (prevUrl = `${where}?page=${this.products.prevPage}&limit=${limit}&sort=${sort}&available=${available}`)
        : null;
      this.products.hasNextPage
        ? (nextUrl = `${where}?page=${this.products.nextPage}&limit=${limit}&sort=${sort}&available=${available}`)
        : null;
    }
    return (toSendObject = {
      status: "success",
      payload: this.products,
      prevLink: prevUrl,
      nextLink: nextUrl,
    });
  };
  addProducts = async (newData) => {
    let toSendObject;
    this.products = await this.model.find().lean();
    try {
      await this.model.create(newData);
      return (toSendObject = await this.model.find().lean());
    } catch {
      return "Error al agregar porducto. Por favor, inténtalo de nuevo.";
    }
  };
  getProductById = async (pid) => {
    let productById = await this.model.findById(pid);
    let toSendObject;
    try {
      return (toSendObject = {
        status: 1,
        // payload: exampleProductManager.readFileAndSave()[+req.params.pid - 1],
        payload: productById,
      }); // -1, puesto que lee desde la posición cero la id, que comienza en uno.
    } catch (error) {
      return "Lo sentimos, ha ocurrido un error enviando la información que intentó capturar.";
    }
  };
  updateProductById = async (pid, latestProduct) => {
    const oldProduct = await this.model.findById(pid).lean();
    let toSendObject;
    try {
      for (let i = 0; i <= 7; i++) {
        if (Object.values(latestProduct)[i] == "") {
          let oldValue = Object.values(oldProduct)[i + 1];
          let myProp = Object.keys(latestProduct)[i];
          latestProduct = { ...latestProduct, [myProp]: oldValue };
        }
      }
      const {
        title,
        description,
        price,
        code,
        stock,
        category,
        status,
        thumbnail,
      } = latestProduct;
      await this.model.findByIdAndUpdate(
        { _id: pid },
        {
          $set: {
            title: title,
            description: description,
            price: +price,
            code: +code,
            stock: +stock,
            category: category,
            status: status,
            thumbnail: thumbnail,
          },
        }
      );
      let updatedObject = await this.model.findById(pid);
      return (toSendObject = {
        status: 1,
        payload: updatedObject,
      });
    } catch {
      return "Error al intentar actualizar el producto.";
    }
  };
  deleteProductById = async (pid) => {
    try {
      await this.model.findByIdAndDelete(pid);
      return `Producto de ID "${pid}" eliminado.`;
    } catch {
      return `Error al intentar eliminar el producto de ID "${pid}".`;
    }
  };
};

const ProductMDBManager = new ProductMDBManagerClass(productsModel);

export default ProductMDBManager;

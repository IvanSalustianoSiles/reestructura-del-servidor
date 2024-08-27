import config from "../config.js";
import { usersModel } from "../models/index.js";

// Clase para controlar los métodos referentes a los usuarios.
class UserManager {
  constructor(model) {
    this.productsArray = [];
    this.path = `./../jsons/product.json`;
    this.getting = false;
    this.model = model;
  }
  isRegistered = (focusRoute, returnObject, req, res) => {
    try {
      return req.session.user
        ? res.render(focusRoute, returnObject)
        : res.redirect("/login");
    } catch (error) {
      console.log(`[ERROR: ${error}]: Error al cortejar los datos de usuario con la sesión.`);
    }
  };
  isRegisteredwToken = (focusRoute, returnObject, req, res) => {
    try {
      return req.cookies[`${config.SECRET}_cookie`] 
      ? res.render(focusRoute, returnObject)
      : res.redirect("/jwtlogin");
    } catch (error) {
      console.log(`[ERROR: ${error}]: Error al cortejar los datos de usuario con el token.`);
    };
  }
  findUser = async (emailValue) => {
    try {
      let myUser = await usersModel.find({ email: emailValue }).lean();
      if (!myUser) return false;
      return myUser[0];
    } catch (error) {
      console.log(`[ERROR: ${error}]: Error al encontrar el usuario en la base de datos.`);
    }
  };
  addUser = async (user) => {
    try {
      const dbUser = await this.model.create({ ...user });
      return dbUser;
    } catch (error) {
      console.log(`[ERROR: ${error}]: Error al agregar el usuario a la base de datos.`);
    }
  };
  updateUser = async (filter, update, options) => {
    try {
      const dbUser = await this.model.findOneAndUpdate(filter, update, options);
      return dbUser;
    } catch (error) {
      console.log(`[ERROR: ${error}]: Error al actualizar el usuario en la base de datos.`);
    }
  };
  deleteUser = async (filter) => {
    try {
      const dbUser = await this.model.findOneAndDelete(filter);
      return dbUser;
    } catch (error) {
      console.log(`[ERROR: ${error}]: Error al eliminar el usuario en la base de datos.`);
    }
  };
  paginateUsers = async (...filters) => {
    try {
      const dbUsers = await this.model.paginate(...filters);
      return dbUsers;
    } catch (error) {
      console.log(`[ERROR: ${error}]: Error al paginar los usuarios desde la base de datos.`);
    }
  }
};

// Métodos a utilizar:
// isRegistered (focusRoute, returnObject, req, res)
// findUser (emailValue)
// addUser (user)
// updateUser (filter, update, options)
// deleteUser (filter)
// paginateUsers (...filters)

const UserMDBManager = new UserManager(usersModel);

export default UserMDBManager;

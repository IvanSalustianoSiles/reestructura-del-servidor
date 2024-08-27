import passport from "passport";
import { Router } from "express";
import config from "../config.js";
import initAuthStrategies from "../auth/passport.strategies.js";
import { UserMDBManager } from "../controllers/index.js";
import { isValidPassword } from "../services/index.js";
import { createHash, verifyRequiredBody, createToken, verifyAndReturnToken } from "../services/index.js";

const router = Router();
const adminAuth = (req, res, next) => {
  if (!req.session.user) return res.redirect("/login");
  if (req.session.user.role != "admin")
    return res
      .status(401)
      .send({ origin: config.SERVER, payload: "Usuario no autorizado." });
  next();
};
const verifyRole = (role) => {
  return (req, res, next) => {
    if (!req.user) return res
    .status(401)
    .send({ origin: config.SERVER, payload: "Usuario no autenticado." });
  
    if (req.user.role != role) return res
    .status(403)
    .send({ origin: config.SERVER, payload: "Usuario no autorizado." });
  
    next();
  }
};
const handlePolicies = (policies) => {
  return async (req, res, next) => {
    if (policies[0] === "PUBLIC") return next();
    let user = verifyAndReturnToken(req, res);
    let role = user.role.toUpperCase();
    if (!policies.includes(role)) return res.status(403).send({origin: config.SERVER, error: `[ERROR 403]: Usuario no autorizado.`});
    req.user = user;
    next();
  }
};
initAuthStrategies();

// Session routes
router.get("/session", async (req, res) => {
  try {
    if (req.session.counter) {
      req.session.counter++;
      res.status(200).send({
        origin: config.SERVER,
        payload: `${req.session.counter} visualizaciones!`,
      });
    } else {
      req.session.counter = 1;
      res.status(200).send({
        origin: config.SERVER,
        payload: `Bienvenido! Eres la primera visualización.`,
      });
    }
  } catch {
    res.send({
      origin: config.SERVER,
      payload: null,
      error: "Error de sessions.",
    });
  }
});
router.post("/login", verifyRequiredBody(["email", "password"]), async (req, res) => {
    try {
      const { email, password } = req.body;
      let myUser = await UserMDBManager.findUser(email);
      const validation = isValidPassword(myUser, password);
      if (myUser && validation) {
        req.session.user = { ...myUser };
        res.redirect("/products");
      } else {
        res.status(401).send("Datos de acceso no válidos.");
      }
    } catch {
      res.status(500).send("Session error.");
    }
  }
);
router.post("/register", verifyRequiredBody([ "first_name", "last_name", "password", "email", "phoneNumber", "description", "age"]), async (req, res) => {
    try {
      let dbUser = await UserMDBManager.findUser(req.body.email);
      let myUser = req.body;
      if (dbUser) {
        return res
          .status(500)
          .send("El correo y/o la contraseña ya están ocupados.");
      }
      req.session.user = { ...myUser, password: createHash(myUser.password) };
      let dbUser2 = await UserMDBManager.addUser({
        ...myUser,
        password: createHash(myUser.password),
      });
      req.session.user.role = dbUser2.role;
      res.redirect("/products");
    } catch {
      res.status(500).send("Session error.");
    }
  }
);
router.post("/pplogin", verifyRequiredBody(["email", "password"]), passport.authenticate("login", { failureRedirect: `/pplogin?error=${encodeURI("Usuario y/o clave no válidos.")}` }), async (req, res) => {
    try {
      req.session.user = req.user;
      req.session.save((error) => {
        if (error)
          return res.status(500).send({
            origin: config.SERVER,
            payload: null,
            error: "Error almacenando datos de sesión.",
          });
        res.redirect("/products");
      });
    } catch (error) {
      res.status(500).send("Error: " + error);
    }
  }
);
router.post("/ppregister", verifyRequiredBody(["first_name", "last_name", "password", "email", "phoneNumber", "description", "age"]), passport.authenticate("register", { failureRedirect: `/ppregister?error=${encodeURI("Email y/o contraseña no válidos.")}` }), async (req, res) => {
    try {
      req.session.user = req.user;
      let dbUser2 = await UserMDBManager.addUser(req.user);
      req.session.user.role = dbUser2.role;
      res.redirect("/products");
    } catch (error) {
      res.status(500).send({origin: config.SERVER, error: `[ERROR 500]: ${error}`});
    }
  }
);
router.get("/ghlogin", passport.authenticate("ghlogin", { scope: ["user"] }), async (req, res) => {
}
);
router.get("/ghlogincallback", passport.authenticate("ghlogin", { failureRedirect: `/login?error=${encodeURI("Error de autenticación con GitHub")}` }), async (req, res) => {
    try {
      req.session.user = req.user;
      req.session.save((error) => {
        if (error)
          return res.status(500).send({
            origin: config.SERVER,
            payload: null,
            error: "Error almacenando datos de sesión.",
          });
        res.redirect("/profile");
      });
    } catch (error) {
      return res
        .status(500)
        .send({ origin: config.SERVER, payload: null, error: error.message });
    }
  }
);
router.get("/private", adminAuth, async (req, res) => {
  if (!req.session.user) {
    res.redirect("/login");
  } else if (req.session.user.role == "admin") {
    try {
      res.status(200).send("Bienvenido, admin.");
    } catch (error) {
      res.status(500).send("Session error: " + error);
    }
  } else {
    try {
      res.status(401).send("Acceso no autorizado.");
    } catch (error) {
      res.status(500).send("Session error: " + error);
    }
  }
});
router.get("/logout", async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err)
        return res.status(500).send({
          origin: config.SERVER,
          payload: "Error al ejecutar logout.",
        });
      res.redirect("/login");
    });
  } catch {
    res.status(200).send({
      origin: config.SERVER,
      payload: null,
      error: "Error de sesión.",
    });
  }
});
router.get("/current", async (req, res) => {
  if (!req.session.user) return res.redirect("/pplogin");
  const myUser = await UserMDBManager.findUser(req.session.user.email);
  res.status(200).send({origin: config.SERVER, payload: myUser });
})

// JWT Routes
router.post("/jwtlogin", verifyRequiredBody(["email", "password"]), passport.authenticate("login", { session: false, failureRedirect: `/jwtlogin?error=${encodeURI("Usuario y/o clave no válidos.")}` }), async (req, res) => {
  try {
    const token = createToken(req.user, '24h');
    res.cookie(`${config.APP_NAME}_cookie`, token, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true });
    res.status(200).send({ origin: config.SERVER, payload: 'Usuario autenticado' });
    
} catch (error) {
    res.status(500).send({ origin: config.SERVER, error: `[ERROR 500]: ${error}` });
}
});
router.post("/jwtregister", verifyRequiredBody(["first_name", "last_name", "password", "email", "phoneNumber", "description", "age"]), passport.authenticate("register", { session: false, failureRedirect: `/jwtregister?error=${encodeURI("Email y/o contraseña no válidos.")}` }), async (req, res) => {
  try {
    const token = createToken(req.user, '24h');
    res.cookie(`${config.APP_NAME}_cookie`, token, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true });
    res.status(200).send({ origin: config.SERVER, payload: 'Usuario autenticado' });
    
  } catch (error) {
    res.status(500).send({ origin: config.SERVER, error: `[ERROR 500]: ${error}` });
  }
})
router.get("/adminByjwt", passport.authenticate("jwtlogin", { session: false }), async (req, res) => {
  try {
    res.status(200).send({origin: config.SERVER, payload: "Bienvenido, admin."});
  } catch (error) {
    res.status(500).send({origin: config.SERVER, error: `[ERROR 500]: ${error}`});
  }
});
router.get("/jwtlogout", passport.authenticate("jwtlogin", { session: false }), async (req, res) => {
  try {
    res.clearCookie(`${config.APP_NAME}_cookie`);
    if (req.cookies[`${config.APP_NAME}_cookie`]) return res.status(500).send({
      origin: config.SERVER,
      error: `[ERROR 500]: Error al ejecutar logout.`,
    });
    res.redirect("/login");
  } catch(error) {
    res.status(500).send({
      origin: config.SERVER,
      error: `[ERROR 500]: ${error}`
    });
  }
});
// router.get("/ghlogincallback", passport.authenticate("ghlogin", { failureRedirect: `/login?error=${encodeURI("Error de autenticación con GitHub")}` }), async (req, res) => {
//   try {
//     const token = createToken(req.user, '24h');
//     res.cookie(`${config.APP_NAME}_cookie`, token, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true });
//     res.status(200).send({ origin: config.SERVER, payload: 'Usuario autenticado' });
//   } catch (error) {
//     res.status(500).send({ origin: config.SERVER, error: `[ERROR 500]: ${error}` });
//   }
// });
export default router;

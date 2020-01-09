const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const auth = {
  login: async (email, password, secretKey) => {
    const user = await User.findOne({ email });
    if (!user) return { error: "Usuario o contraseña incorrectos" };
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return { error: "Usuario o contraseña incorrectos" };

    const token = await jwt.sign(
      {
        _id: user._id,
        name: user.name,
        date: user.date
      },
      secretKey
    );
    return { message: "Login correcto", token };
  },
  checkToken: (req, res, next) => {
    const token = req.header("Authorization");
    const jwtToken = token ? token.split(" ")[1] : null;

    if (jwtToken) {
      try {
        const payload = jwt.verify(
          jwtToken,
          process.env.SECRET_KEY_JWT_COURSE_API
        );
        req.user = payload;
        req.user.auth = true;
      } catch (e) {
        console.log(e.message);
        req.user = { auth: false };
      }
    } else {
      req.user = { auth: false };
    }
    return next();
  }
};

module.exports = auth;

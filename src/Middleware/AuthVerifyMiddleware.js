var jwt = require("jsonwebtoken");
const Users = require("../models/UserModel");
const AuthVerifyMiddleware = async (req, res, next) => {
  try {
    const token = req.headers["token"];
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    if (!decode) {
      return res.status(401).json({ status: "fail", data: "Token is invalid" });
    }
    const User = await Users.findOne({ email: decode.email });
    if (!User) {
      return res.status(404).json({ status: "fail", data: "User not found" });
    }
    req.headers["email"] = User.email;
    req.decode = decode;
    next();
  } catch (error) {
    console.log(error);
  }
};
module.exports = AuthVerifyMiddleware;

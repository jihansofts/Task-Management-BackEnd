const UserModel = require("../models/UserModel");
const OTPModel = require("../models/OTPModel");
const SendEmailUtility = require("../utility/SendEmailUtility");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Registration

exports.Registrations = async (req, res) => {
  try {
    const user = new UserModel(req.body);
    user.password = await bcrypt.hash(req.body.password, 10);
    const result = await user.save();
    res.status(201).json({ status: "success", data: result });
  } catch (error) {
    res.status(500).json({ status: "fail", data: error });
  }
};

exports.Logins = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email: email });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ status: "fail", data: "Invalid Password" });
      }
      const token = jwt.sign({ email: user.email }, process.env.SECRET_KEY, {
        expiresIn: "1d",
      });
      res.status(201).json({ status: "success", data: token, user: user });
    } else {
      res.status(401).json({ status: "fail", data: "User Not Found" });
    }
  } catch (error) {
    res.status(500).json({ status: "fail", data: error });
  }
};

exports.UpdateProfiles = async (req, res) => {
  try {
    let email = req.headers["email"];
    let reqBody = req.body;
    if (reqBody.password) {
      reqBody.password = await bcrypt.hash(reqBody.password, 10);
    }
    const data = await UserModel.updateOne({ email: email }, reqBody);
    console.log(data, "data");
    res.status(201).json({ status: "success", data: data });
  } catch (error) {
    res.status(401).json({ status: "fail", data: error });
  }
};

exports.DeleteUser = (req, res) => {
  let id = req.params.id;
  let user = { _id: id };
  UserModel.deleteMany(user, (err, data) => {
    if (err) {
      res.status(401).json({ status: "Fail", data: err });
    } else {
      res.status(201).json({ status: "success", data: data });
    }
  });
};

exports.UserProfileDetails = async (req, res) => {
  let email = req.headers["email"];
  const emailFind = await UserModel.find({ email: email });
  if (emailFind) {
    res.status(201).json({ status: "success", data: emailFind });
  } else {
    res.status(401).json({ status: "fail", data: "User Not Found" });
  }
};

exports.RecoveryVerifyEmail = async (req, res) => {
  let email = req.params.email;
  let OTPcode = Math.floor(100000 + Math.random() * 900000);
  try {
    let UserCount = await UserModel.aggregate([
      { $match: { email: email } },
      { $count: "total" },
    ]);
    if (UserCount.length > 0) {
      let CreateOtp = await OTPModel.create({ email: email, otp: OTPcode });
      let SendEmail = await SendEmailUtility(
        email,
        "Your PIN Code is =" + OTPcode,
        "Task Manager PIN Verification"
      );
      res.status(201).json({ status: "success", data: SendEmail });
    } else {
      res.status(402).json({ status: "fail", data: "User Not Found" });
    }
  } catch (e) {
    res.status(401).json({ status: "fail", data: e });
  }
};

exports.RecoveryVerifyOTP = async (req, res) => {
  let email = req.params.email;
  let OTPcode = req.params.otp;
  let status = 0;
  try {
    let OTPCount = await OTPModel.aggregate([
      { $match: { email: email, otp: OTPcode, status: status } },
      { $count: "total" },
    ]);
    if (OTPCount.length > 0) {
      let OTPUpdate = await OTPModel.updateOne(
        {
          email: email,
          otp: OTPcode,
          status: 0,
        },
        { status: 1 }
      );
      res.status(201).json({ status: "success", data: OTPUpdate });
    } else {
      res.status(401).json({ status: "success", data: "Invalid OTP Code" });
    }
  } catch (e) {
    res.status(402).json({ status: "fail", data: e });
  }
};

exports.ResetPassword = async (req, res) => {
  let email = req.body["email"];
  let OTPCode = req.body["OTP"];
  let NewPass = req.body["password"];
  let statusUpdate = 1;

  try {
    let OTPUsedCount = await OTPModel.aggregate([
      { $match: { email: email, otp: OTPCode, status: statusUpdate } },
      { $count: "total" },
    ]);
    if (OTPUsedCount.length > 0) {
      let PassUpdate = await UserModel.updateOne(
        { email: email },
        { password: NewPass }
      );
      res.status(200).json({ status: "success", data: PassUpdate });
    } else {
      res.status(401).json({ status: "fail", data: "Invalid Request" });
    }
  } catch (e) {
    res.status(402).json({ status: "fail", data: e });
  }
};

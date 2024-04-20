const UserModel = require("../models/UserModel");
const OTPModel = require("../models/OTPModel");
const SendEmailUtility = require("../utility/SendEmailUtility");
const jwt = require("jsonwebtoken");

// Registration

exports.Registrations = async (req, res) => {
  try {
    const user = new UserModel(req.body);
    const result = await user.save();
    res.status(201).json({ status: "success", data: result });
  } catch (error) {
    res.status(500).json({ status: "fail", data: error });
  }
};

exports.Logins = async (req, res) => {
  let reqBody = req.body;
  const data = await UserModel.aggregate([
    { $match: reqBody },
    {
      $project: {
        _id: 1,
        email: 1,
        firstName: 1,
        lastName: 1,
        mobile: 1,
        photo: 1,
        password: 1,
      },
    },
  ]);
  let token = jwt.sign({ users: data }, process.env.SECRET_KEY);
  if (data.length > 0) {
    res.status(201).json({ status: "success", token: token, data: data });
  } else {
    res.status(401).json({ status: "fail", data: "User Not Found" });
  }
  try {
  } catch (error) {
    res.status(401).json({ status: "fail", data: error });
  }
};

exports.UpdateProfiles = async (req, res) => {
  try {
    let email = req.headers["email"];
    let reqBody = req.body;
    const data = await UserModel.updateOne({ email: email }, reqBody);
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

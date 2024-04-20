const mongoose = require("mongoose");

const DataSchema = mongoose.Schema(
  {
    email: { type: String, unique: true },
    firstName: { type: String },
    lastName: { type: String },
    password: { type: String },
    mobile: { type: String },
    photo: { type: String },
    createDate: { type: Date, default: Date.now() },
  },
  { versionKey: false }
);
DataSchema.path("email").validate(async (email) => {
  const emailCount = await mongoose.models.users.countDocuments({ email });
  return !emailCount;
}, "Email Already Exists");

const UserModel = mongoose.model("users", DataSchema);

module.exports = UserModel;

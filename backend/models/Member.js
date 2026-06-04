const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    memberType: { type: String, default: "Student" },
    name: { type: String, required: true },
    className: { type: String, default: "" },
    rollNo: { type: String, default: "" },
    registrationNo: { type: String, default: "" },
    mobile: { type: String, default: "" },
    fatherName: { type: String, default: "" },
    dob: { type: String, default: "" },
    bloodGroup: { type: String, default: "" },
    address: { type: String, default: "" },
    validity: { type: String, default: "" },
    photo: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);
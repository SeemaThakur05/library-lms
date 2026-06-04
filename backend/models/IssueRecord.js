const mongoose = require("mongoose");

const issueRecordSchema = new mongoose.Schema(
  {
    accessionNo: String,
    bookTitle: String,

    memberType: {
      type: String,
      default: "Student",
    },

    studentName: String,
    rollNo: String,
    registrationNo: String,
    mobile: String,

    issueDate: String,
    dueDate: String,
    returnDate: {
      type: String,
      default: "",
    },

    reissueCount: {
      type: Number,
      default: 0,
    },

    fine: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      default: "Issued",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("IssueRecord", issueRecordSchema);
const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  accNo: {
    type: String,
    required: true,
    unique: true,
  },

  title: {
    type: String,
    default: "",
  },

  author: {
    type: String,
    default: "",
  },

  publisher: {
    type: String,
    default: "",
  },

  year: {
    type: String,
    default: "",
  },

  callNo: {
    type: String,
    default: "",
  },

  status: {
    type: String,
    default: "Available",
  },

  availability: {
    type: String,
    default: "Available",
  },

  },
{
  timestamps: true
}
);

module.exports = mongoose.model("Book", bookSchema);
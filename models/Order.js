const mongoose = require("mongoose");

const Order = new mongoose.Schema(
  {
    sender: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    Time: {
      type: String,
      required: true,
    },
    Option: {
      type: String,
      required: true,
    },
    Type: {
      type: String,
      required: true,
    },
    Qty: {
      type: Number,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    CMP: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("order", Order);

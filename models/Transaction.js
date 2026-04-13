const mongoose = require("mongoose");

const Transaction = new mongoose.Schema(
  {
    sender: {
      type: String,
      required: true,
    },
    stocks: {
      type: String,
      required: true,
    },
    avg: {
      type: Number,
      required: true,
    },
    qty: {
      type: Number,
      required: true,
    },
    cmp: {
      type: Number,
      required: true,
    },
    value_cost: {
      type: Number,
      required: true,
    },
    value_cmp: {
      type: Number,
      required: true,
    },
    day_gain: {
      type: Number,
      required: true,
    },
    returun: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("transaction", Transaction);

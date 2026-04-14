const Transaction = require("../models/Transaction");
const Fund_history = require("../models/Fund_history");
const Order = require("../models/Order");
const Total_fund = require("../models/Total_fund");
const Fund = require("../models/Fund");

// PORTFOLIO - get all transactions (admin: all, user: own)
const getTransacton_history = async (req, res) => {
  const transaction = await Transaction.find({}).sort({ updatedAt: -1 });
  return res.status(200).json({ transaction });
};

const postTransaction_history = async (req, res) => {
  const options = { new: true };
  const updatedata = req.body;
  const result = await Transaction.findByIdAndUpdate(req.body._id, updatedata, options);
  if (!result) return res.status(404).send({ message: "Transaction not found" });
  const transaction = await Transaction.find({});
  return res.status(200).json({ transaction });
};

// MARKET - crear operación (buy/sell) → genera Position + Order + ajusta Funds
const createMarketOrder = async (req, res) => {
  const { ticker, qty, price, type, sender } = req.body;

  if (!ticker || !qty || !price || !type || !sender) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const now = new Date();
  const formattedTime = `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
  const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;

  const totalValue = parseFloat(qty) * parseFloat(price);

  // 1. Verificar fondos si es Buy
  if (type === "B") {
    const userFunds = await Fund.find({ sender });
    let balance = 0;
    userFunds.forEach(f => {
      if (f.Format === "fund" && f.Type === "success") balance += f.amount;
      if (f.Format === "withdraw" && f.Type === "success") balance -= f.amount;
    });
    if (balance < totalValue) {
      return res.status(400).json({ message: "Insufficient funds" });
    }
  }

  // 2. Crear posición en Transaction (Portfolio/Position)
  const newTransaction = new Transaction({
    sender,
    stocks: ticker.toUpperCase(),
    qty: parseFloat(qty),
    avg: parseFloat(price),
    cmp: parseFloat(price),
    value_cost: totalValue,
    value_cmp: totalValue,
    day_gain: 0,
    returun: 0,
  });
  await newTransaction.save();

  // 3. Crear orden en Orders
  const newOrder = new Order({
    sender,
    name: ticker.toUpperCase(),
    status: "successful",
    Time: formattedTime,
    Option: formattedDate,
    Type: type, // "B" o "S"
    Qty: parseFloat(qty),
    value: totalValue,
    CMP: parseFloat(price),
    price: parseFloat(price),
  });
  await newOrder.save();

  // 4. Ajustar fondos (registrar como transacción en Fund)
  const fundEntry = new Fund({
    sender,
    Format: type === "B" ? "withdraw" : "fund",
    Date: formattedDate,
    Time: formattedTime,
    Transaction_id: newOrder._id.toString(),
    Type: "success",
    amount: totalValue,
  });
  await fundEntry.save();

  return res.status(201).json({ message: "Order created successfully", order: newOrder });
};

// FUND HISTORY
const getFund_history = async (req, res) => {
  const fund = await Fund.find({});
  return res.status(200).json({ fund });
};

const putFund_history = async (req, res) => {
  const options = { new: true };
  const updatedata = req.body;
  const result = await Fund.findByIdAndUpdate(req.body._id, updatedata, options);
  if (!result) return res.status(404).send({ message: "Fund not found" });
  return res.status(200).json({ msg: "success" });
};

const postFund_history = async (req, res) => {
  const new_fund = new Fund(req.body);
  await new_fund.save();
  const fund = await Fund.find({});
  return res.status(200).json({ fund });
};

const getAdminFund = async (req, res) => {
  const found_fund = await Fund.find({});
  const fund = found_fund.filter((item) => item.Type === "pending");
  return res.status(200).json({ fund });
};

// ORDERS - get filtrado por usuario (admin ve todos)
const getOrder = async (req, res) => {
  const order = await Order.find({}).sort({ createdAt: -1 });
  return res.status(200).json({ order });
};

const deleteOrder = async (req, res) => {
  const userId = req.params.id;
  const result = await Order.findByIdAndDelete(userId);
  if (!result) return res.status(404).send({ message: "Order not found" });
  const order = await Order.find({}).sort({ createdAt: -1 });
  return res.status(200).json({ order });
};

const postOrder = async (req, res) => {
  const options = { new: true };
  const updatedata = req.body;
  const result = await Order.findByIdAndUpdate(req.body._id, updatedata, options);
  if (!result) return res.status(404).send({ message: "Order not found" });
  const order = await Order.find({}).sort({ createdAt: -1 });
  return res.status(200).json({ order });
};

// TOTAL FUND
const getTotal_fund = async (req, res) => {
  const total_fund = await Total_fund.find({});
  return res.status(200).json({ total_fund });
};

const postTotal_fund = async (req, res) => {
  await Total_fund.deleteMany({});
  const fund = req.body;
  fund.map(async (item) => {
    let total_fund = new Total_fund(item);
    await total_fund.save();
  });
  return res.status(200).json({ msg: "success" });
};

module.exports = {
  getTransacton_history,
  getFund_history,
  postFund_history,
  getOrder,
  getTotal_fund,
  postTotal_fund,
  postTransaction_history,
  postOrder,
  deleteOrder,
  getAdminFund,
  putFund_history,
  createMarketOrder,
  getMarketPrice,
};


// PROXY de precio - evita CORS del navegador con Yahoo Finance
async function getMarketPrice(req, res){
  const { symbol } = req.params;
  if (!symbol) return res.status(400).json({ message: "Symbol required" });

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      // Intentar con query2 si query1 falla
      const url2 = `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`;
      const response2 = await fetch(url2, {
        headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" },
      });
      if (!response2.ok) {
        return res.status(404).json({ message: "Ticker no encontrado" });
      }
      const data2 = await response2.json();
      const price2 = data2?.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (!price2) return res.status(404).json({ message: "Precio no disponible" });
      return res.status(200).json({ symbol, price: parseFloat(price2.toFixed(4)) });
    }

    const data = await response.json();
    const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
    const currency = data?.chart?.result?.[0]?.meta?.currency || "USD";
    const previousClose = data?.chart?.result?.[0]?.meta?.previousClose;
    const change = price && previousClose ? (price - previousClose).toFixed(4) : 0;
    const changePct = price && previousClose
      ? (((price - previousClose) / previousClose) * 100).toFixed(2)
      : 0;

    if (!price) return res.status(404).json({ message: "Precio no disponible para este ticker" });

    return res.status(200).json({
      symbol,
      price: parseFloat(price.toFixed(4)),
      currency,
      change: parseFloat(change),
      changePct: parseFloat(changePct),
      previousClose,
    });
  } catch (error) {
    console.error("Error fetching price:", error);
    return res.status(500).json({ message: "Error al obtener el precio de mercado" });
  }
};

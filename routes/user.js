const express = require("express");
const router = express.Router();

const {
  login,
  register,
  dashboard,
  getAllUsers,
  registeragain,
  deleteUser,
  logBoolean
} = require("../controllers/user");

const {
  getTransacton_history,
  getOrder,
  getFund_history,
  postFund_history,
  getTotal_fund,
  postTotal_fund,
  postTransaction_history,
  postOrder,
  deleteOrder,
  getAdminFund,
  putFund_history,
  createMarketOrder,
  getMarketPrice,
} = require("../controllers/transaction");

const authMiddleware = require("../middleware/auth");

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/registeragain").post(authMiddleware, registeragain);
router.route("/dashboard").get(authMiddleware, dashboard);
router.route("/getAllusers").get(authMiddleware, getAllUsers);
router.route("/getAllusers/:id").delete(authMiddleware, deleteUser);

// Portfolio / Position
router.route("/getTransacton_history").get(authMiddleware, getTransacton_history);
router.route("/getTransacton_history").post(authMiddleware, postTransaction_history);

// Market - precio en tiempo real (proxy para evitar CORS)
router.route("/getMarketPrice/:symbol").get(authMiddleware, getMarketPrice);

// Market - crear operación
router.route("/createMarketOrder").post(authMiddleware, createMarketOrder);

// Fund
router.route("/getFund_history").get(authMiddleware, getFund_history);
router.route("/getFund_history").post(authMiddleware, postFund_history);
router.route("/getpending").get(authMiddleware, getAdminFund);
router.route("/getpending").put(authMiddleware, putFund_history);

// Orders
router.route("/getOrder").get(authMiddleware, getOrder);
router.route("/getOrder").post(authMiddleware, postOrder);
router.route("/getOrder/:id").delete(authMiddleware, deleteOrder);

// Total fund (donaciones comunidad)
router.route("/getTotal_fund").get(authMiddleware, getTotal_fund);
router.route("/getTotal_fund").post(authMiddleware, postTotal_fund);

// Logout
router.route("/logout").post(logBoolean);

module.exports = router;

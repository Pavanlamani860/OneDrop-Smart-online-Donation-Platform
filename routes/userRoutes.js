const express = require("express");
const router = express.Router();

const {
  getUserProfile,
  getEditProfile,
  updateProfile,
  getChangePassword,
  changePassword,
} = require("../controllers/userController");

const { isLoggedIn } = require("../middlewares/authMiddleware");

// My Profile
router.get("/", isLoggedIn, getUserProfile);

// Edit Profile
router.get("/edit", isLoggedIn, getEditProfile);
router.post("/edit", isLoggedIn, updateProfile);

// Change Password
router.get("/change-password", isLoggedIn, getChangePassword);
router.post("/change-password", isLoggedIn, changePassword);

module.exports = router;

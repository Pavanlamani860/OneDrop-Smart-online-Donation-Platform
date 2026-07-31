const User = require("../models/User");
const validNgo = require("../models/validNgo");
const extractTextFromImage = require("../utils/ocr");
const bcrypt = require("bcryptjs");

// REGISTER
const registerUser = async (req, res) => {
  try {
    const { name, contactPerson, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      req.flash("error", "All fields are required.");
      return res.redirect("/api/auth/signup");
    }

    if (role === "ngo" && !contactPerson) {
      req.flash("error", "Contact Person is required.");
      return res.redirect("/api/auth/signup");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      req.flash("error", "User already exists.");
      return res.redirect("/api/auth/signup");
    }

    let isNgoVerified = false;
    let certificatePath = null;
    let extractedRegNo = null;

    // NGO OCR verification
    if (role === "ngo") {
      if (!req.file) {
        req.flash("error", "NGO certificate is required.");
        return res.redirect("/api/auth/signup");
      }

      const text = await extractTextFromImage(req.file.path);
      console.log("OCR TEXT:\n", text);

      const regMatch = text.match(
        /Registration\s*Number\s*:?\s*([A-Za-z0-9-]+)/i,
      );

      if (!regMatch) {
        req.flash("error", "Could not detect registration number.");
        return res.redirect("/api/auth/signup");
      }

      extractedRegNo = regMatch[1];
      console.log("Extracted Registration Number:", extractedRegNo);

      const foundNgo = await validNgo.findOne({
        registrationNumber: extractedRegNo,
      });

      if (!foundNgo) {
        req.flash("error", "Invalid NGO certificate.");
        return res.redirect("/api/auth/signup");
      }

      isNgoVerified = true;
      certificatePath = req.file.path;
    }

    await User.create({
      name,
      contactPerson,
      email,
      password,
      role,
      ngoRegistrationNumber: extractedRegNo,
      ngoCertificate: certificatePath,
      isNgoVerified,
    });

    req.flash("success", "Registration successful. Please login.");
    res.redirect("/api/auth/login");
  } catch (error) {
    console.error(error);
    req.flash("error", "Server error. Please try again.");
    res.redirect("/api/auth/signup");
  }
};

// LOGIN
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.comparePassword(password))) {
    req.session.user = {
      _id: user._id,
      name: user.name,
      contactPerson: user.contactPerson,
      email: user.email,
      role: user.role,
    };

    res.redirect("/");
  } else {
    req.flash("error", "Invalid email or password.");
    res.redirect("/api/auth/login");
  }
};

// LOGOUT
const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Logout failed");
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
};

// RENDER FORMS --> login
const renderLoginForm = (req, res) => {
  res.render("users/login");
};

// signup
const renderSignupForm = (req, res) => {
  res.render("users/signup");
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  renderLoginForm,
  renderSignupForm,
};

const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const ValidNgo = require("./models/validNgo");
const methodOverride = require("method-override");
const flash = require("connect-flash");

dotenv.config();
connectDB();

const app = express();
app.use(methodOverride("_method"));

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ===== SESSION CONFIG =====
const sessionOption = {
  secret: "12345678",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOption));
app.use(flash()); //Connecting Flash

//Make flash Message availbel to all EJS pages
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

//Set EJS Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ===== ROUTES =====
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const donationRoutes = require("./routes/donationRoutes");
const sendThankYouEmail = require("./utils/sendMail");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/donations", donationRoutes);

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS loaded:", process.env.EMAIL_PASS ? "YES" : "NO");

// ===== HOME ROUTE =====
app.get("/", (req, res) => {
  res.render("index", { user: req.session.user || null });
});

// ===== TEST MAIL ROUTE =====
app.get("/test-mail", async (req, res) => {
  await sendThankYouEmail(
    "abhishekpatil1664@gmail.com",
    "Test",
    "Test Campaign",
    100,
  );
  res.send("Mail sent");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

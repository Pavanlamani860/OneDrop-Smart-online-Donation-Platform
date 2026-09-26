const Campaign = require("../models/Campaign");
const Donation = require("../models/Donation");

//Get user Profile
const getUserProfile = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.redirect("/api/auth/login");
    }

    let campaigns = [];
    let donations = [];

    //Ngo Profile
    if (user.role === "ngo") {
      // campaigns created by NGO
      campaigns = await Campaign.find({ creator: user._id });
      // donations received for NGO campaigns
      donations = await Donation.find({
        campaign: { $in: campaigns.map((c) => c._id) },
      })
        .populate("user", "name email")
        .populate("campaign", "title");
    }

    //User Profile
    if (user.role === "user") {
      donations = await Donation.find({ user: user._id }).populate(
        "campaign",
        "title",
      );
    }

    // Filter donations with deleted campaigns
    donations = donations.filter((d) => d.campaign !== null);

    res.render("profile", {
      user,
      campaigns,
      donations,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

//Edit Profile Page
const getEditProfile = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.redirect("/api/auth/login");
    }

    res.render("editProfile", {
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

//Update Profile Page
const updateProfile = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const { name, email, contactPerson } = req.body;
    const User = require("../models/User");
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }
    user.name = name;
    user.email = email;

    // Update contact person only for NGO
    if (user.role === "ngo") {
      user.contactPerson = contactPerson;
    }
    await user.save();

    // Update session user
    req.session.user.name = user.name;
    req.session.user.email = user.email;

    if (user.role === "ngo") {
      req.session.user.contactPerson = user.contactPerson;
    }

    res.redirect("/api/users");
  } catch (err) {
    console.error(err);

    // Duplicate email
    if (err.code === 11000) {
      return res.status(400).send("Email already exists");
    }

    res.status(500).send("Server Error");
  }
};

//Change Password Page
const getChangePassword = async (req, res) => {
  try {
    const user = req.session.user;

    if (!user) {
      return res.redirect("/api/auth/login");
    }

    res.render("changePassword", {
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

//Chage Password
const changePassword = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const User = require("../models/User");
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).send("Current password is incorrect");
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).send("New passwords do not match");
    }
    user.password = newPassword;

    // pre("save") middleware will hash it
    await user.save();
    res.redirect("/api/users");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

module.exports = {
  getUserProfile,
  getEditProfile,
  updateProfile,
  getChangePassword,
  changePassword,
};

const Donation = require("../models/Donation");
const Campaign = require("../models/Campaign");
const User = require("../models/User");
const sendThankYouEmail = require("../utils/sendMail");

// RENDER DONATION CHOICE
const renderDonateChoice = async (req, res) => {
  const campaign = await Campaign.findById(req.params.campaignId);
  res.render("donations/donate_choice", { campaign });
};

// RENDER MONEY PAGE

const renderDonateMoney = async (req, res) => {
  const campaign = await Campaign.findById(req.params.campaignId);
  res.render("donations/donate_money", { campaign });
};

// RENDER ITEMS PAGE

const renderDonateItems = async (req, res) => {
  const campaign = await Campaign.findById(req.params.campaignId);
  res.render("donations/donate_items", { campaign });
};

// =========================
// POST MONEY DONATION
// =========================
const donateMoneyToCampaign = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/api/auth/login");
    }

    const { amount } = req.body;

    const donationAmount = Number(amount);

    if (isNaN(donationAmount) || donationAmount <= 0) {
      return res.status(400).send("Invalid donation amount");
    }

    const campaign = await Campaign.findById(req.params.campaignId).populate(
      "creator",
      "name email",
    );

    if (!campaign) {
      return res.status(404).send("Campaign not found");
    }

    // Update raised amount
    campaign.raisedAmount += donationAmount;
    await campaign.save();

    // Save donation
    await Donation.create({
      user: req.session.user._id,
      campaign: campaign._id,
      type: "money",
      amount: donationAmount,
    });

    // Send Thank You Email
    const donor = await User.findById(req.session.user._id);

    if (donor && donor.email) {
      try {
        await sendThankYouEmail(
          donor.email,
          donor.name,
          campaign.title,
          donationAmount,
        );
      } catch (err) {
        console.error("Email Error:", err.message);
      }
    }

    res.redirect("/api/campaigns");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// =========================
// POST ITEM DONATION
// =========================
const donateItemsToCampaign = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/api/auth/login");
    }

    const { itemType, quantity, pickupAddress, phone } = req.body;

    const campaign = await Campaign.findById(req.params.campaignId);

    if (!campaign) {
      return res.status(404).send("Campaign not found");
    }

    // Save donation
    await Donation.create({
      user: req.session.user._id,
      campaign: req.params.campaignId,
      type: "item",
      itemType,
      quantity,
      pickupAddress,
      phone,
      status: "pending pickup",
    });

    // Send Thank You Email
    const donor = await User.findById(req.session.user._id);

    if (donor && donor.email) {
      try {
        await sendThankYouEmail(
          donor.email,
          donor.name,
          campaign.title,
          "Items / Clothes",
        );
      } catch (err) {
        console.error("Email Error:", err.message);
      }
    }

    res.redirect("/api/campaigns");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// =========================
// STATS
// =========================
const getDonationStats = async (req, res) => {
  try {
    const campaignId = req.params.campaignId;

    const donations = await Donation.find({ campaign: campaignId });

    const totalAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);

    const totalDonors = donations.length;

    const averageDonation =
      totalDonors > 0 ? (totalAmount / totalDonors).toFixed(2) : 0;

    res.render("donations/stats", {
      totalAmount,
      totalDonors,
      averageDonation,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

module.exports = {
  renderDonateChoice,
  renderDonateMoney,
  renderDonateItems,
  donateMoneyToCampaign,
  donateItemsToCampaign,
  getDonationStats,
};

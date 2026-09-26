const Donation = require("../models/Donation");
const Campaign = require("../models/Campaign");
const User = require("../models/User");
const sendThankYouEmail = require("../utils/sendMail");

//Render Donation Choice
const renderDonateChoice = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId);
    if (!campaign) {
      return res.status(404).send("Campaign not found");
    }
    // Block completed campaigns
    if (campaign.status === "completed") {
      req.flash(
        "error",
        "This campaign has been completed. Donations are no longer accepted.",
      );
      return res.redirect(`/api/campaigns/${campaign._id}`);
    }
    // Check deadline
    if (new Date(campaign.deadline) < new Date()) {
      campaign.status = "expired";
      await campaign.save();
      req.flash(
        "error",
        "This campaign has expired. Donations are no longer accepted.",
      );
      return res.redirect(`/api/campaigns/${campaign._id}`);
    }
    res.render("donations/donate_choice", { campaign });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// Render Money Page
const renderDonateMoney = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId);
    if (!campaign) {
      return res.status(404).send("Campaign not found");
    }

    if (campaign.status === "completed") {
      req.flash(
        "error",
        "This campaign has been completed. Donations are no longer accepted.",
      );
      return res.redirect(`/api/campaigns/${campaign._id}`);
    }

    if (new Date(campaign.deadline) < new Date()) {
      campaign.status = "expired";
      await campaign.save();
      req.flash(
        "error",
        "This campaign has expired. Donations are no longer accepted.",
      );
      return res.redirect(`/api/campaigns/${campaign._id}`);
    }
    res.render("donations/donate_money", { campaign });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// Render item Page
const renderDonateItems = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId);
    if (!campaign) {
      return res.status(404).send("Campaign not found");
    }

    if (campaign.status === "completed") {
      req.flash(
        "error",
        "This campaign has been completed. Donations are no longer accepted.",
      );
      return res.redirect(`/api/campaigns/${campaign._id}`);
    }

    if (new Date(campaign.deadline) < new Date()) {
      campaign.status = "expired";
      await campaign.save();
      req.flash(
        "error",
        "This campaign has been completed. Donations are no longer accepted.",
      );
      return res.redirect(`/api/campaigns/${campaign._id}`);
    }
    res.render("donations/donate_items", { campaign });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// =========================
// Post Money Donation
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

    // Check campaign status
    if (campaign.status === "completed") {
      req.flash(
        "error",
        "This campaign has been completed. Donations are no longer accepted.",
      );
      return res.redirect(`/api/campaigns/${campaign._id}`);
    }

    // Check deadline
    if (new Date(campaign.deadline) < new Date()) {
      campaign.status = "expired";
      await campaign.save();
      req.flash(
        "error",
        "This campaign has expired. Donations are no longer accepted.",
      );
      return res.redirect(`/api/campaigns/${campaign._id}`);
    }

    // Update raised amount
    campaign.raisedAmount += donationAmount;
    // Mark completed if target reached
    if (campaign.raisedAmount >= campaign.targetAmount) {
      campaign.status = "completed";
    }

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

    // Check campaign status
    if (campaign.status === "completed") {
      req.flash(
        "error",
        "This campaign has been completed. Donations are no longer accepted.",
      );
      return res.redirect(`/api/campaigns/${campaign._id}`);
    }

    // Check deadline
    if (new Date(campaign.deadline) < new Date()) {
      campaign.status = "expired";
      await campaign.save();
      req.flash(
        "error",
        "This campaign has expired. Donations are no longer accepted.",
      );
      return res.redirect(`/api/campaigns/${campaign._id}`);
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

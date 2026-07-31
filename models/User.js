const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // User Full Name OR NGO Name
    name: {
      type: String,
      required: true,
    },

    // NGO Contact Person (required only for NGO accounts)
    contactPerson: {
      type: String,
      required: function () {
        return this.role === "ngo";
      },
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "ngo"],
      default: "user",
    },

    // NGO Registration Number extracted after OCR verification
    ngoRegistrationNumber: {
      type: String,
    },

    // Uploaded certificate path
    ngoCertificate: {
      type: String,
    },

    // Verification status
    isNgoVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password during login
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);

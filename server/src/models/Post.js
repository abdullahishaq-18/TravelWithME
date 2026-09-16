const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    photoUrl: { type: String, default: null },
    caption: { type: String, required: true },
    location: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);

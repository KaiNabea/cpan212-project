const { get } = require("http");
const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  film: { type: String, required: true, minLength: 1 },
  rating: { type: Number, required: true, min: 0.1, max: 10.0, default: null},
  review: { type: String, required: true, maxLength: 500},
  createdAt: { type: Date, default: Date.now },
}, {
  toJSON: {getters: true},
  toObject: {getters: true}
});

ReviewSchema.index({ film: "text", rating: "number", review: "text" });

const ReviewModel = mongoose.model("reviews", ReviewSchema);

module.exports = ReviewModel;
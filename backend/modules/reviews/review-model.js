const { get } = require("http");
const mongoose = require("mongoose");
const { type } = require("os");

const ReviewSchema = new mongoose.Schema({
  film: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "titles",
    required: true
  },
  rating: { type: Number, required: true, min: 0.1, max: 10.0, default: null},
  review: { type: String, required: true, maxLength: 500},
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  createdAt: { type: Date, default: Date.now },
}, {
  versionKey: false,
  toJSON: {getters: true, virtuals: true, id: false},
  toObject: {getters: true, virtuals: true, id: false}
});

ReviewSchema.index({ review: "text" });

const ReviewModel = mongoose.model("reviews", ReviewSchema);

module.exports = ReviewModel;
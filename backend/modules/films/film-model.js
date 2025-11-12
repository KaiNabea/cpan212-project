const mongoose = require("mongoose");

const FilmSchema = new mongoose.Schema({
  title: { type: String, required: true, minLength: 1 },
  genre: { type: String, required: true, minLength: 6, default: "" },
  release_date: { type: Date, required: true },
  rating: { type: Number, min: 0.1, max: 10.0, default: null},
  createdAt: { type: Date, default: Date.now() },
});

FilmSchema.index({ title: "text", genre: "text" });

const FilmModel = mongoose.model("titles", FilmSchema);

module.exports = FilmModel;
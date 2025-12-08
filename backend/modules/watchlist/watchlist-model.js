const mongoose = require("mongoose");

const WatchlistSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    minLength: 1,
    maxLength: 100,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  films: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "titles"
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false,
  toJSON: { getters: true, virtuals: true, id: false },
  toObject: { getters: true, virtuals: true, id: false }
});

WatchlistSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

WatchlistSchema.index({ user: 1, name: 1 });
WatchlistSchema.index({ isPublic: 1 });

const WatchlistModel = mongoose.model("watchlists", WatchlistSchema);

module.exports = WatchlistModel;
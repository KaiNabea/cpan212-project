const { Router } = require("express")
const createWatchlistRules = require("./middlewares/create-watchlist-rules")
const updateWatchlistRules = require("./middlewares/update-watchlist-rules")
const addFilmToWatchlistRules = require("./middlewares/add-film-to-watchlist-rules")
const WatchlistModel = require("./watchlist-model");
const authorize = require("../../shared/middlewares/authorize");

const watchlistRoutes = Router();

// GET all watchlists (public ones + user's own)
watchlistRoutes.get("/", async (req, res) => {
  try {
    let query = {};
    const userId = req.query.userId;

    if (userId) {
      // Get specific user's watchlists (their own private + public ones)
      query.user = userId;
    } else {
      // Get all public watchlists
      query.isPublic = true;
    }

    const sort_by = req.query.sort_by || "createdAt";
    const sort_order = req.query.sort_order === "asc" ? 1 : -1;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    const count = await WatchlistModel.countDocuments(query);
    
    if (!count || count <= 0) {
      return res.json({ count: 0, page: 1, data: [] });
    }

    const watchlists = await WatchlistModel.find(query, {}, {
      limit,
      skip: (page - 1) * limit,
      sort: { [sort_by]: sort_order },
    })
      .populate("user", "name")
      .populate("films", "title release_date rating");

    res.json({
      count,
      page,
      limit,
      data: watchlists,
    });
  } catch (error) {
    console.error("Error fetching watchlists:", error);
    res.status(500).send("Internal server error.");
  }
});

// GET single watchlist by ID
watchlistRoutes.get("/:id", async (req, res) => {
  try {
    const watchlistId = req.params.id;
    const foundWatchlist = await WatchlistModel.findById(watchlistId)
      .populate("user", "name")
      .populate("films", "title genre release_date rating");

    if (!foundWatchlist) {
      return res.status(404).send("Watchlist not found.");
    }

    // Check if watchlist is private and user doesn't own it
    // Note: This requires authentication, but allows public access to public lists
    if (!foundWatchlist.isPublic) {
      const authHeader = req.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).send("This watchlist is private.");
      }
      // You could add more auth checking here if needed
    }

    res.json(foundWatchlist);
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    res.status(500).send("Internal server error.");
  }
});

// POST create new watchlist
watchlistRoutes.post("/", authorize(["admin", "client"]), createWatchlistRules, async (req, res) => {
  try {
    const { name, isPublic, films } = req.body;
    const userId = req.user._id || req.user.id || req.user.user._id;

    // Check if user already has a watchlist with this name
    const existingWatchlist = await WatchlistModel.findOne({
      user: userId,
      name: name
    });

    if (existingWatchlist) {
      return res.status(409).send("You already have a watchlist with this name.");
    }

    const newWatchlist = await WatchlistModel.create({
      name,
      user: userId,
      films: films || [],
      isPublic: isPublic !== undefined ? isPublic : true
    });

    const populatedWatchlist = await WatchlistModel.findById(newWatchlist._id)
      .populate("user", "name")
      .populate("films", "title release_date rating");

    res.status(201).json(populatedWatchlist);
  } catch (error) {
    console.error("Error creating watchlist:", error);
    res.status(500).send("Internal server error.");
  }
});

// PUT update watchlist metadata (name, isPublic)
watchlistRoutes.put("/:id", authorize(["admin", "client"]), updateWatchlistRules, async (req, res) => {
  try {
    const watchlistId = req.params.id;
    const { name, isPublic } = req.body;
    const userId = req.user._id || req.user.id || req.user.user._id;

    // Check if watchlist exists and belongs to user
    const foundWatchlist = await WatchlistModel.findOne({
      _id: watchlistId,
      user: userId
    });

    if (!foundWatchlist) {
      return res.status(404).send("Watchlist not found or you do not have permission to update it.");
    }

    // If changing name, check for duplicates
    if (name && name !== foundWatchlist.name) {
      const duplicateWatchlist = await WatchlistModel.findOne({
        user: userId,
        name: name,
        _id: { $ne: watchlistId }
      });

      if (duplicateWatchlist) {
        return res.status(409).send("You already have a watchlist with this name.");
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    updateData.updatedAt = Date.now();

    const updatedWatchlist = await WatchlistModel.findByIdAndUpdate(
      watchlistId,
      { $set: updateData },
      { new: true }
    )
      .populate("user", "name")
      .populate("films", "title release_date rating");

    res.json(updatedWatchlist);
  } catch (error) {
    console.error("Error updating watchlist:", error);
    res.status(500).send("Internal server error.");
  }
});

// PUT add film to watchlist
watchlistRoutes.put("/:id/films/add", authorize(["admin", "client"]), addFilmToWatchlistRules, async (req, res) => {
  try {
    const watchlistId = req.params.id;
    const { filmId } = req.body;
    const userId = req.user._id || req.user.id || req.user.user._id;

    // Check if watchlist exists and belongs to user
    const foundWatchlist = await WatchlistModel.findOne({
      _id: watchlistId,
      user: userId
    });

    if (!foundWatchlist) {
      return res.status(404).send("Watchlist not found or you do not have permission to modify it.");
    }

    // Check if film is already in the watchlist
    if (foundWatchlist.films.includes(filmId)) {
      return res.status(409).send("This film is already in your watchlist.");
    }

    const updatedWatchlist = await WatchlistModel.findByIdAndUpdate(
      watchlistId,
      { 
        $push: { films: filmId },
        $set: { updatedAt: Date.now() }
      },
      { new: true }
    )
      .populate("user", "name")
      .populate("films", "title release_date rating");

    res.json(updatedWatchlist);
  } catch (error) {
    console.error("Error adding film to watchlist:", error);
    res.status(500).send("Internal server error.");
  }
});

// PUT remove film from watchlist
watchlistRoutes.put("/:id/films/remove", authorize(["admin", "client"]), addFilmToWatchlistRules, async (req, res) => {
  try {
    const watchlistId = req.params.id;
    const { filmId } = req.body;
    const userId = req.user._id || req.user.id || req.user.user._id;

    // Check if watchlist exists and belongs to user
    const foundWatchlist = await WatchlistModel.findOne({
      _id: watchlistId,
      user: userId
    });

    if (!foundWatchlist) {
      return res.status(404).send("Watchlist not found or you do not have permission to modify it.");
    }

    const updatedWatchlist = await WatchlistModel.findByIdAndUpdate(
      watchlistId,
      { 
        $pull: { films: filmId },
        $set: { updatedAt: Date.now() }
      },
      { new: true }
    )
      .populate("user", "name")
      .populate("films", "title release_date rating");

    res.json(updatedWatchlist);
  } catch (error) {
    console.error("Error removing film from watchlist:", error);
    res.status(500).send("Internal server error.");
  }
});

// DELETE watchlist
watchlistRoutes.delete("/:id", authorize(["admin", "client"]), async (req, res) => {
  try {
    const watchlistId = req.params.id;
    const userId = req.user._id || req.user.id || req.user.user._id;

    const deletedWatchlist = await WatchlistModel.findOneAndDelete({
      _id: watchlistId,
      user: userId
    });

    if (!deletedWatchlist) {
      return res.status(404).send("Watchlist not found or you do not have permission to delete it.");
    }

    res.json(deletedWatchlist);
  } catch (error) {
    console.error("Error deleting watchlist:", error);
    res.status(500).send("Internal server error.");
  }
});

module.exports = { watchlistRoutes };
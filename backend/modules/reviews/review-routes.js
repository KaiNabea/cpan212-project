const { Router } = require("express")
const addReviewRules = require("./middleware/create-review-rules")
const updateReviewRules = require("./middleware/update-review-rules")
const authorize = require("../../shared/middlewares/authorize")
const ReviewModel = require("./review-model")

const reviewRoutes = Router()

reviewRoutes.get("/", async (req, res) => {
  let query = {}
  const filmId = req.query.filmId
  const userId = req.query.userId
  if (filmId) {
    query.film = filmId
  }
  if (userId) {
    query.user = userId
  }
  await ReviewModel.syncIndexes()
  const count = await ReviewModel.countDocuments(query)
  if (!count || count <= 0) return res.send({ count: 0, page: 1, data: [] })
  const sort_by = req.query.sort_by || "createdAt"
  const sort_order = req.query.sort_order === "asc" ? 1 : -1
  const limit = parseInt(req.query.limit) || 10
  const page = parseInt(req.query.page) || 1
  const allReviews = await ReviewModel.find(query, {}, {
    limit,
    skip: (page - 1) * limit,
    sort: { [sort_by]: sort_order },
  })
  res.json({
    count,
    page,
    limit,
    data: allReviews,
  })
})

reviewRoutes.post("/", authorize, addReviewRules, async (req, res) => {
    const userID = req.user._id;
    const newReview = req.body;
    const existingReview = await ReviewModel.findOne({ 
        film: newReview.film, 
        user: userID 
    });
    if (existingReview) {
        return res.status(409).send(`Error: User has already reviewed this film.`);
    }
    const addedReview = await ReviewModel.create({
        user: userID,
        film: newReview.film,
        rating: newReview.rating,
        review: newReview.review
    });
    res.json(addedReview);
});


reviewRoutes.put("/:id", authorize, updateReviewRules, async (req, res) => {
    const reviewID = req.params.id;
    const newReview = req.body;
    const foundReview = await ReviewModel.findOne({ 
        _id: reviewID, 
        user: req.user._id 
    });
    
    if (!foundReview) {
        return res.status(404).send(`Review not found or you do not have permission to update it.`);
    }
    const updateReview = await ReviewModel.findByIdAndUpdate(
        reviewID,
        {
            $set: {
                rating: newReview.rating,
                review: newReview.review,
            },
        },
        { new: true }
    )
    res.json(updateReview);
})


reviewRoutes.delete("/:id", authorize, async (req, res) => {
    const reviewID = req.params.id
    const foundReview = await ReviewModel.findOneAndDelete({
        _id: reviewID,
        user: req.user._id
    })
    if (!foundReview) {
        return res.status(404).send(`Review not found or you do not have permission to delete it.`);
    }
    res.json(foundReview);
})

module.exports = { reviewRoutes }
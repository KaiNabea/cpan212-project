const { Router } = require("express")
const addFilmRules = require("./middlewares/add-film-rules")
const updateFilmRules = require("./middlewares/update-film-rules")
const authorize = require("../../shared/middlewares/authorize")
const FilmModel = require("./film-model")
const getFilmRules = require("./middlewares/get-film-rules")

const filmRoutes = Router();

filmRoutes.get("/films", getFilmRules, async (req, res) => {
  await FilmModel.syncIndexes()
  let search = req.query.search || ""
  const filmQuery = search
    ? {
        title: { $regex: search, $options: "i" }
      }
    : {}
  const count = await FilmModel.countDocuments(filmQuery); 
  if (!count || count <= 0) return res.json({ count: 0, page: 1, data: [] })
  const sort_by = req.query.sort_by || "createdAt"
  const sort_order = req.query.sort_order === "asc" ? 1 : -1
  const limit = parseInt(req.query.limit) || 10
  const page = parseInt(req.query.page) || 1
  const allFilms = await FilmModel.find(
    filmQuery,
    {},
    {
      limit,
      skip: (page - 1) * limit,
      sort: { [sort_by]: sort_order },
    }
  )
  res.json({
    count,
    page,
    limit,
    data: allFilms,
  })
})

filmRoutes.get("/films/:id", async (req, res) => {
  const filmID = req.params.id;
  const foundFilm = await FilmModel.findById(filmID);
  if (!foundFilm) {
    return res.status(404).send(`Title with ${filmID} doesn't exist`);
  }
  res.json(foundFilm);
});

filmRoutes.post("/films", authorize(["admin"]), addFilmRules, async (req, res) => {
  const newProduct = req.body;
  const addedProduct = await FilmModel.create({
    title: newProduct.title,
    genre: newProduct.genre,
    release_date: newProduct.release_date,
    rating: newProduct.rating,
  });
  if (!addedProduct) {
    return res.status(500).send(`Oops! Title couldn't be added!`);
  }
  res.json(addedProduct);
});

filmRoutes.put("/films/:id", authorize(["admin"]), updateFilmRules, async (req, res) => {
  const filmID = req.params.id;
  const newProduct = req.body;
  const foundFilm = await FilmModel.exists({ id: filmID });
  if (!foundFilm) {
    return res.status(404).send(`Title with ${filmID} doesn't exist`);
  }
  const updatedProduct = await FilmModel.findByIdAndUpdate(
    filmID,
    {
      $set: {
        title: newProduct.title,
        release_date: newProduct.release_date,
        rating: newProduct.rating,
        genre: newProduct.genre,
      },
    },
    { new: true }
  );
  if (!updatedProduct) {
    return res.status(500).send(`Oops! Product couldn't be updated!`);
  }
  res.json(updatedProduct);
});

filmRoutes.delete("/films/:id", authorize(["admin"]), async (req, res) => {
  const filmID = req.params.id;
  const foundFilm = await FilmModel.findById(filmID);
  if (!foundFilm) {
    return res.status(404).send(`Title with ${filmID} doesn't exist`);
  }
  const deletedProduct = await FilmModel.findByIdAndDelete(filmID, {
    new: true,
  });
  if (!deletedProduct) {
    return res.status(500).send(`Oops! Title couldn't be deleted!`);
  }
  res.json(deletedProduct);
});

module.exports = { filmRoutes };
var express = require("express");
const Stores = require("../db/stores");
var router = express.Router();
const {
  fetchFromYelp,
  postYelpResults,
  fetchFromDb,
  updateDb
} = require("../functions");

/* GET home page. */
router.get("/:location", async function(req, res, next) {
  try {
    const places = await fetchFromYelp(req.query);
    res.send({
      myLocation: { lat: req.query.lat, lng: req.query.lng },
      stores: places
    });
  } catch (err) {
    console.log(err);
  }
});

router.post("/update", async function(req, res, next) {
  try {
    const updatedStore = await updateDb(req.query.yelpId, req.query.tpAmount);
    console.log(updatedStore);
    res.send(updatedStore);
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;

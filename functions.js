const { yelpKey } = require("./secrets");
const yelp = require("yelp-fusion");
const Stores = require("./db/stores");

const fetchFromYelp = async ({ lat, lng }) => {
  searchRequest = {
    latitude: lat,
    longitude: lng,
    categories: "pharmacy,grocery,convenience",
    limit: 50
  };

  const client = yelp.client(yelpKey);
  const yelpResultsArray = await client.search(searchRequest).then(response => {
    return response.jsonBody.businesses;
  });
  const normalizedResults = yelpResultsArray.reduce((accum, store) => {
    accum[store.id] = store;
    return accum;
  }, {});
  const tpData = await fetchFromDb(normalizedResults);
  tpData.forEach(store => {
    let entry = normalizedResults[store.yelpId];
    entry.hasTPInStock = store.hasTPInStock;
    entry.updatedAt = store.updatedAt;
  });
  return Object.values(normalizedResults);
};

const fetchFromDb = async stores => {
  const tpData = await Stores.findAll({
    where: {
      yelpId: Object.keys(stores)
    }
  });
  return tpData;
};

const postYelpResults = async (stores, hasTp = 0) => {
  let newRows = 0;
  Object.values(stores).forEach(async store => {
    const formattedStore = {
      hasTPInStock: hasTp,
      yelpId: store.id
    };
    let updated = await Stores.findOrCreate({
      where: { yelpId: store.id },
      defaults: formattedStore
    });
    if (updated[1]) newRows++;
  });
  return newRows;
};

const getDistance = (currLat, currLong, destLat, destLong) => {
  function toRad(x) {
    return (x * Math.PI) / 180;
  }
  const R = 6371;
  const dLat = toRad(currLat - destLat);
  const dLon = toRad(currLong - destLong);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(currLat)) *
      Math.cos(toRad(destLat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const result = R * c;
  return result.toFixed(1);
};

module.exports = { fetchFromYelp, postYelpResults, fetchFromDb };

const { yelpKey } = require("./secrets");
const yelp = require("yelp-fusion");
const Stores = require("./db/stores");
const NodeCache = require("node-cache");
const $cache = new NodeCache({ stdTTL: 60 * 60 * 3 });

const fetchFromYelp = async ({ lat, lng }) => {
  let yelpResultsArray = $cache.get(
    `lat${Number(lat).toFixed(2)}lng${Number(lng).toFixed(2)}`
  );
  if (!yelpResultsArray) {
    searchRequest = {
      latitude: lat,
      longitude: lng,
      categories: "pharmacy,grocery,convenience",
      limit: 50
    };
    const client = yelp.client(yelpKey);
    yelpResultsArray = await client.search(searchRequest).then(response => {
      return response.jsonBody.businesses;
    });
    $cache.set(
      `lat${Number(lat).toFixed(2)}lng${Number(lng).toFixed(2)}`,
      yelpResultsArray
    );
  }
  const normal = yelpResultsArray.reduce((accum, item) => {
    accum[item.id] = item;
    return accum;
  }, {});
  const tpData = await fetchFromDb(normal);
  tpData.forEach(data => {
    normal[data.yelpId].yelpId = data.yelpId;
    normal[data.yelpId].hasTPInStock = data.hasTPInStock;
    normal[data.yelpId].updatedAt = data.updatedAt;
  });
  yelpResultsArray = Object.values(normal);
  return yelpResultsArray;
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

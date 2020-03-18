const db = require("./database");
const Sequelize = require("sequelize");

const Stores = db.define("stores", {
  hasTPInStock: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  yelpId: {
    type: Sequelize.STRING
  }
});

module.exports = Stores;

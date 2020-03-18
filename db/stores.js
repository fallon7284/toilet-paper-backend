const db = require("./database");
const Sequelize = require("sequelize");

const Stores = db.define("stores", {
  // lat: {
  //   type: Sequelize.FLOAT,
  //   allowNull: false
  // },
  // lng: {
  //   type: Sequelize.FLOAT,
  //   allowNull: false
  // },
  // name: {
  //   type: Sequelize.STRING,
  //   allowNull: false
  // },
  hasTPInStock: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  yelpId: {
    type: Sequelize.STRING
  }
  // imageUrl: {
  //   type: Sequelize.STRING,
  //   allowNull: true
  // }
});

module.exports = Stores;

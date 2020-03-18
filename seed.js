const db = require("./db/database");
const Stores = require("./db/stores");
const { red, green } = require("chalk");

const seedStores = [
  {
    hasTPInStock: 0,
    yelpId: "987345jhwerg89h9eg"
  }
];

const seed = async () => {
  try {
    await db.sync({ force: true });
    await Stores.bulkCreate(seedStores);
  } catch (err) {
    console.log(red(err));
  }
};

module.exports = seed;

if (require.main === module) {
  seed()
    .then(() => {
      console.log(green("Seeding success!"));
      db.close();
    })
    .catch(err => {
      console.error(red("Oh noes! Something went wrong!"));
      console.error(err);
      db.close();
    });
}

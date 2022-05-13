const fs = require("fs");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");
const seeders = require("./seeders");

const sequelize = new Sequelize(
	process.env.DB_NAME,
	process.env.DB_USERNAME,
	process.env.DB_PASSWORD,
	{
		host: process.env.DB_HOST,
		dialect: process.env.DB_DRIVER,
		port: process.env.DB_PORT,
		dialectOptions: {
			useUTC: false,
		},
		timezone: process.env.DB_TIMEZONE,
		pool: {
			max: 5,
			min: 0,
			idle: 10000,
		},
	}
);

sequelize
	.authenticate()
	.then(() => {
		console.log("Connection has been established successfully.");
	})
	.catch((error) => {
		console.error("Unable to connect to the database: ", error);
	});

const db = {
	Sequelize,
	sequelize,
	createTransaction: () => sequelize.transaction(),
};

fs.readdirSync(path.join(__dirname, "models"))
	.filter((file) => {
		return (
			file.indexOf(".") !== 0 &&
			file.slice(-3) === ".js" &&
			!file.includes("helpers")
		);
	})
	.forEach((file) => {
		const model = require(path.join(__dirname, "models", file))(
			sequelize,
			DataTypes
		);
		db[model.name] = model;
	});

for (const key in db) {
	if (db[key].associate) {
		db[key].associate(db);
	}
}

// run mini migration
// sequelize.sync();

// run seed
// (async () => {
// 	if (seeders && Boolean(process.env.DB_SEEDING)) {
// 		let seeds = [
// 			{
// 				key: "roles",
// 				model: "Role",
// 			},
// 			{
// 				key: "flatforms",
// 				model: "Flatform",
// 			},
// 		];
// 		seeds = seeds.filter((item) => Object.keys(seeders).includes(item.key));

// 		const transaction = await db.createTransaction();
// 		try {
// 			for (const item of seeds) {
//                 console.log(item);
// 				await db[item.model].destroy({
// 					truncate: true,
// 					transaction,
// 				});
// 				await db[item.model].bulkCreate(seeders[item.key], {
// 					transaction,
// 				});
// 			}
// 			await transaction.commit();
// 		} catch (error) {
// 			await transaction.rollback();
// 		}
// 	}
// })();

module.exports = db;

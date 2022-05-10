const bcrypt = require("bcrypt");
const { Model } = require("sequelize");
const { getList, getById } = require("./helpers");

module.exports = (sequelize, DataTypes) => {
	class User extends Model {
		static associate(models) {
			this.includes = () => [];
			this.excludes = () => ["password", "refreshToken"];
		}

		static STATUS_ACTIVE = 1;
		static STATUS_INACTIVE = -1;
		static STATUSES = [this.STATUS_ACTIVE, this.STATUS_INACTIVE];
		static SORTED_KEYS = ["ID", "STATUS", "CREATED_AT", "UPDATED_AT"];

		static getList = async (page, perPage, query, allPages, sortedBy) => {
			return getList(
				this,
				{ page, perPage },
				{ query, allPages, sortedBy },
				{ includes: this.includes(), excludes: this.excludes() }
			);
		};
		static getById = async (id) => {
			return getById(this, {
				id,
				includes: this.includes(),
				excludes: this.excludes(),
			});
		};
	}
	User.init(
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			username: {
				type: DataTypes.STRING,
			},
			password: {
				type: DataTypes.STRING,
				set(value) {
					this.setDataValue(
						"password",
						bcrypt.hashSync(
							value.trim(),
							bcrypt.genSaltSync(process.env.BCRYPT_SALT_ROUNDS)
						)
					);
				},
			},
			refreshToken: {
				field: "refresh_token",
				type: DataTypes.STRING,
			},
			status: {
				type: DataTypes.INTEGER,
			},
		},
		{
			sequelize,
			modelName: "User",
			tableName: "users",
			updatedAt: "updatedAt",
			createdAt: "createdAt",
			underscored: true,
			timestamps: true,
		}
	);

	return User;
};

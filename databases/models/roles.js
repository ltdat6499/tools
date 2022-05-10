const { Model } = require("sequelize");
const { getList, getById } = require("./helpers");

module.exports = (sequelize, DataTypes) => {
	class Role extends Model {
		static associate(models) {
			this.belongsTo(models.Flatform, {
				as: "flatform",
				foreignKey: "flatformId",
				targetKey: "id",
			});

			this.includes = () => [];
			this.excludes = () => ["logs", "password"];
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
	Role.init(
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			name: {
				type: DataTypes.STRING,
			},
			flatformId: {
				field: "flatform_id",
				type: DataTypes.INTEGER,
			},
			status: {
				type: DataTypes.INTEGER,
			},
			type: {
				type: DataTypes.INTEGER,
			},
			status: {
				type: DataTypes.INTEGER,
			},
		},
		{
			sequelize,
			modelName: "Role",
			tableName: "roles",
			updatedAt: "updatedAt",
			createdAt: "createdAt",
			underscored: true,
			timestamps: true,
		}
	);

	return Role;
};

const { Model } = require("sequelize");
const { getList, getById } = require("./helpers");

module.exports = (sequelize, DataTypes) => {
	class Permission extends Model {
		static associate(models) {
			this.belongsTo(models.Flatform, {
				as: "flatform",
				foreignKey: "flatformId",
				targetKey: "id",
			});
			this.belongsToMany(this, {
				as: "childs",
				through: {
					model: models.PermissionsHavePermissions,
					unique: true,
				},
				foreignKey: "parentId",
				sourceKey: "id",
				otherKey: "childId",
			});

			this.includes = () => [];
			this.excludes = () => [];
		}

		static METHOD_GET = { mapper: 1, value: "GET" };
		static METHOD_POST = { mapper: 2, value: "POST" };
		static METHOD_PUT = { mapper: 3, value: "PUT" };
		static METHODS = [this.METHOD_GET, this.METHOD_POST, this.METHOD_PUT];

		static STATUS_ACTIVE = 1;
		static STATUS_INACTIVE = -1;
		static STATUS_NOT_FOUND = -2;
		static STATUSES = [
			this.STATUS_ACTIVE,
			this.STATUS_INACTIVE,
			this.STATUS_NOT_FOUND,
		];

		static TYPE_SINGLE = 1;
		static TYPE_GROUP = 2;
		static TYPES = [this.TYPE_SINGLE, this.TYPE_GROUP];

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
	Permission.init(
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			name: {
				type: DataTypes.STRING,
			},
			route: {
				type: DataTypes.STRING,
			},
			method: {
				type: DataTypes.INTEGER,
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
		},
		{
			sequelize,
			modelName: "Permission",
			tableName: "permissions",
			updatedAt: "updatedAt",
			createdAt: "createdAt",
			underscored: true,
			timestamps: true,
		}
	);

	return Permission;
};

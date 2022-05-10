const { Model } = require("sequelize");
const { getList, getById } = require("./helpers");

module.exports = (sequelize, DataTypes) => {
	class UsersHavePermissions extends Model {
		static associate(models) {
			this.belongsTo(models.User, {
				as: "user",
				foreignKey: "userId",
				targetKey: "id",
			});
			this.belongsTo(models.Permission, {
				as: "permission",
				foreignKey: "permissionId",
				targetKey: "id",
			});

			this.includes = () => [];
			this.excludes = () => [];
		}

		static STATUS_ACTIVE = 1;
		static STATUS_INACTIVE = -1;
		static STATUSES = [this.STATUS_ACTIVE, this.STATUS_INACTIVE];

		static TYPE_INCLUDE = 1;
		static TYPE_EXCLUDE = -1;
		static TYPES = [this.TYPE_INCLUDE, this.TYPE_EXCLUDE];

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
	UsersHavePermissions.init(
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			userId: {
				field: "user_id",
				type: DataTypes.INTEGER,
			},
			permissionId: {
				field: "permission_id",
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
			modelName: "UsersHavePermissions",
			tableName: "users_have_permissions",
			updatedAt: "updatedAt",
			createdAt: "createdAt",
			underscored: true,
			timestamps: true,
		}
	);

	return UsersHavePermissions;
};

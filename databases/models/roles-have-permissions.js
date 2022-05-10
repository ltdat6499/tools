const { Model } = require("sequelize");
const { getList, getById } = require("./helpers");

module.exports = (sequelize, DataTypes) => {
	class RolesHavePermissions extends Model {
		static associate(models) {
			this.belongsTo(models.Role, {
				as: "role",
				foreignKey: "roleId",
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

		static TYPE_INCLUDE = 1;
		static TYPE_EXCLUDE = -1;
		static TYPES = [this.TYPE_INCLUDE, this.TYPE_EXCLUDE];

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
	RolesHavePermissions.init(
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			roleId: {
				field: "role_id",
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
		},
		{
			sequelize,
			modelName: "RolesHavePermissions",
			tableName: "roles_have_permissions",
			updatedAt: "updatedAt",
			createdAt: "createdAt",
			underscored: true,
			timestamps: true,
		}
	);

	return RolesHavePermissions;
};

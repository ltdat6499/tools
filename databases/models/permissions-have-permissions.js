const { Model } = require("sequelize");
const { getList, getById } = require("./helpers");

module.exports = (sequelize, DataTypes) => {
	class PermissionsHavePermissions extends Model {
		static associate(models) {
			this.belongsTo(models.Permission, {
				as: "parent",
				foreignKey: "parentId",
				targetKey: "id",
			});
			this.belongsTo(models.Permission, {
				as: "child",
				foreignKey: "childId",
				targetKey: "id",
			});

			this.includes = () => [];
			this.excludes = () => [];
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
	PermissionsHavePermissions.init(
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			parentId: {
				field: "parent_id",
				type: DataTypes.INTEGER,
			},
			childId: {
				field: "child_id",
				type: DataTypes.INTEGER,
			},
			name: {
				type: DataTypes.STRING,
			},
			status: {
				type: DataTypes.INTEGER,
			},
		},
		{
			sequelize,
			modelName: "PermissionsHavePermissions",
			tableName: "permissions_have_permissions",
			updatedAt: "updatedAt",
			createdAt: "createdAt",
			underscored: true,
			timestamps: true,
		}
	);

	return PermissionsHavePermissions;
};

const { Op } = require("sequelize");
const _ = require("lodash");
const { Permission, Flatform, createTransaction } = require("../databases");

const createPermissionsByRouters = async (routers) => {
	// get flatform by env
	const flatform = await Flatform.findOne({
		where: {
			name: process.env.FLATFORM,
			status: Flatform.STATUS_ACTIVE,
		},
		attributes: ["id"],
		raw: true,
	});
	if (!flatform) {
		return;
	}

	// get mapRouters = [{ route, method }] from routers
	let mapRouters = [];
	for (const router of routers) {
		mapRouters = [
			...mapRouters,
			...router.stack.map((item) => ({
				route: item.path,
				method: Permission.METHODS.find((method) =>
					item.methods.includes(method.value)
				).mapper,
				status: Permission.STATUS_ACTIVE,
				type: Permission.TYPE_SINGLE,
				flatformId: flatform.id,
			})),
		];
	}

	// get all permissions by flatform
	const permissions = await Permission.findAll({
		where: {
			flatformId: flatform.id,
			type: Permission.TYPE_SINGLE,
		},
		attributes: ["id", "route", "method", "status"],
		raw: true,
	});

	// create permissions if not exist
	const comparePermission = (left, right) => {
		if (left.route === right.route && left.method === right.method) return true;
		return false;
	};
	const notExistPermissions = _.differenceWith(
		mapRouters,
		permissions,
		comparePermission
	);

	const transaction = await createTransaction();
	if (notExistPermissions.length) {
		try {
			await Permission.bulkCreate(notExistPermissions, { transaction });
		} catch (error) {
			console.log(error);
			await transaction.rollback();
			return;
		}
	}

	// set NOT FOUND status if permissions not found in routers
	const extinctPermissions = _.differenceWith(
		permissions,
		mapRouters,
		comparePermission
	);
	if (extinctPermissions.length) {
		try {
			await Permission.update(
				{ status: Permission.STATUS_NOT_FOUND },
				{
					transaction,
					where: {
						id: {
							[Op.in]: extinctPermissions.map((item) => item.id),
						},
					},
				}
			);
		} catch (error) {
			console.log(error);
			await transaction.rollback();
			return;
		}
	}

	// set ACTIVE status if permissions found when db set as NOT FOUND status
	const notFoundStatusPermissions = permissions.filter(
		(item) => item.status === Permission.STATUS_NOT_FOUND
	);
	if (notFoundStatusPermissions.length) {
		const reactivePermissions = notFoundStatusPermissions.filter((item) =>
			mapRouters.some(
				(mapper) => mapper.route === item.route && mapper.method === item.method
			)
		);
		try {
			await Permission.update(
				{ status: Permission.STATUS_ACTIVE },
				{
					transaction,
					where: {
						id: {
							[Op.in]: reactivePermissions.map((item) => item.id),
						},
					},
				}
			);
		} catch (error) {
			console.log(error);
			await transaction.rollback();
			return;
		}
	}

	await transaction.commit();
};

module.exports = { createPermissionsByRouters };

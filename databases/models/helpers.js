const getList = async (model, pageInfo, rule, association) => {
	let { page, perPage } = pageInfo;
	const { includes, excludes } = association;
	const { query, allPages, sortedBy } = rule;

	const total = await model.count({
		where: query,
		include: includes,
		distinct: true,
		col: "id",
	});
	let hasNextPage = false;
	let hasPreviousPage = false;

	let conds = {
		where: query,
		include: includes,
		attributes: {
			exclude: excludes,
		},
		order: sortedBy,
	};
	if (allPages) {
		page = 1;
		perPage = total;
	} else {
		hasNextPage = (page - 1) * perPage + perPage < total ? true : false;
		hasPreviousPage = page - 1 > 0 ? true : false;
		conds = {
			...conds,
			offset: (page - 1) * perPage,
			limit: perPage,
		};
	}
	const results = await model.findAll(conds);
	return {
		pageInfo: {
			total,
			page,
			perPage,
			hasNextPage,
			hasPreviousPage,
		},
		data: JSON.parse(JSON.stringify(results)),
	};
};

const getById = async (model, rule) => {
	const { id, includes, excludes } = rule;
	let result = await model.findOne({
		where: {
			id,
		},
		attributes: {
			exclude: excludes,
		},
		include: includes,
	});
	if (!result) {
		result = {};
	}
	return {
		data: JSON.parse(JSON.stringify(result)),
	};
};

module.exports = { getList, getById };

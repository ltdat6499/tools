const axios = require("axios");

axios.defaults.headers.common = {
	Authorization: `bearer eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsInVzZXJuYW1lIjoibWluaGhvYWkiLCJlbWFpbCI6ImhvYWlfZGVwX3RyYWlAZ21haWwuY29tIiwiaWF0IjoxNjUyNDE0MDk0fQ.WBQNbOMZkVMrWaNVZopIIl4KdsVqJzrUM9Aw5kUdR6QNdaqyo_VdgebyUGGDNvyXS41ttBU2UTIkPmEegB1NdQ`,
};
(async () => {
	const input = [...Array(100)].map(
		() => axios.get("http://192.168.59.101:30056/v1/ip")
	);

	const results = await Promise.all(input);
	console.log(results.map((item) => item.data.results[0]));
})();

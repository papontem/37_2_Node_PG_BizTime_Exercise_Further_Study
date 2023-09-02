/** Server startup for BizTime. */

const app = require("./app");
const port = 3002;

app.listen(port, function () {
	console.log(`Listening on ${port}`);
});

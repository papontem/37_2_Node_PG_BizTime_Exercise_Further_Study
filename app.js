/** BizTime express application. */

const express = require("express");

const app = express();
const ExpressError = require("./expressError");
// externall middleware request logger
const morgan = require("morgan");

const companyRoutes = require("./routes/companies");
const invoiceRoutes = require("./routes/invoices");

// Parse request bodies for JSON
app.use(express.json());
// requierement for using morgan logger, setting environment to development
// app.use(morgan("test"));
app.use(morgan("dev"));

// ROUTES
//get page icon
app.get("/favicon.ico", (req, res) => res.sendStatus(204));

// set the prefix for routes leading to company and invoice resources.
// /companies
app.use("/companies", companyRoutes);
// /invoices
app.use("/invoices", invoiceRoutes);

/** 404 handler */

app.use(function (req, res, next) {
	const err = new ExpressError("Not Found", 404);
	return next(err);
});

/** general error handler */
// PAM: this is printing a a wierd error where 
// the message is apearing on screen twice...
app.use((err, req, res, next) => {
	res.status(err.status || 500);

	return res.json({
		error: err,
		message: err.message,
	});
});

module.exports = app;

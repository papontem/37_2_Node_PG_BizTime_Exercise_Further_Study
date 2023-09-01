/** Routes for invoices of biztime app */

const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

// GET ALL INVOICES FROM DATABASE
router.get("/", async (req, res, next) => {
	// Making sure to try and catch any error that may occur as
	// we wait the async db.query promise response
	try {
		// PAM: making sql quries db.query(`SQL STRING`)
		console.log("Getting all Invoices....");
		const results = await db.query(`SELECT id, comp_code FROM invoices`);
		// console.log(results.rows);
		return res.json({ invoices: results.rows });
	} catch (e) {
		return next(e);
	}
});

// GET /:id get the first invoice that matches with id
router.get("/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		const results = await db.query("SELECT * FROM invoices WHERE id = $1", [
			id,
		]);
		if (results.rows.length === 0) {
			throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
		}
		// console.log(results.rows);

		return res.send({ invoice: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});

// POST /invoices create a new invoice
router.post("/", async (req, res, next) => {
	try {
		const { comp_code, amt } = req.body;
		const results = await db.query(
			"INSERT INTO invoices ( comp_code, amt ) VALUES ($1, $2) RETURNING *",
			[comp_code, amt]
		);
		return res.status(201).json({ invoice: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});

// PUT/PATCH /invoices/:id update existing invoice and allows for paying off the invoice
router.patch("/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		const { amt, paid } = req.body;

		// Get the invoice in question
		let invoiceResults = await db.query("SELECT * FROM invoices WHERE id=$1", [
			id,
		]);
		// was this invoice already paid?
		let isPaid = invoiceResults.rows[0].paid;

		// If paying unpaid invoice: sets paid_date to today
		if (paid && !isPaid) {
			// console.log("PAYING");

			const today = new Date();
			const updateQuery =
				"UPDATE invoices SET amt=$1, paid=true, paid_date=$2 WHERE id=$3 RETURNING *";
			const updateParams = [amt, today, id];
			const updateResults = await db.query(updateQuery, updateParams);

			if (updateResults.rows.length === 0) {
				throw new ExpressError(`Can't update invoice with id of ${id}`, 404);
			}
			return res.send({ invoice: updateResults.rows[0] });
		}
		// If un-paying: sets paid_date to null
		if (!paid && isPaid) {
			// console.log("UNPAYING");

			const updateQuery =
				"UPDATE invoices SET amt=$1, paid=false, paid_date=null WHERE id=$2 RETURNING *";
			const updateParams = [amt, id];
			const updateResults = await db.query(updateQuery, updateParams);

			if (updateResults.rows.length === 0) {
				throw new ExpressError(`Can't update invoice with id of ${id}`, 404);
			}
			return res.send({ invoice: updateResults.rows[0] });
		}
		// Else: keep current paid_date
		// console.log("NOT CHANGING paid Value, paid date stays the same");

		const updateQuery = "UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING *";
		const updateParams = [amt, id];
		const updateResults = await db.query(updateQuery, updateParams);

		if (updateResults.rows.length === 0) {
			throw new ExpressError(`Can't update invoice with id of ${id}`, 404);
		}
		return res.send({ invoice: updateResults.rows[0] });
	} catch (e) {
		return next(e);
	}
});

// DELETE /invoices/:id delete an invoice
router.delete("/:code", async (req, res, next) => {
	try {
		const results = await db.query("DELETE FROM invoices WHERE id = $1", [
			req.params.id,
		]);
		return res.send({ status: "deleted" });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;

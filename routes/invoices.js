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
		// get the invoice in question
		let invoice_Results = await db.query("SELECT * FROM invoices where id=$1", [id])
		let is_paid = invoice_Results.rows[0].paid

		// If paying unpaid invoice: sets paid_date to today
		if(paid && !is_paid){
			console.log("PAYING");
			// paid_date to today
			// return?
		}
		// If un-paying: sets paid_date to null
		if(!paid && is_paid ){
			console.log("UNPAYING");
			// paid_date to null
			// return?
		}
		// Else: keep current paid_date
		// were only changing amt...?
		

		const update_Results = await db.query(
			"UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING *",
			[amt, id]
		);
		if (update_Results.rows.length === 0) {
			throw new ExpressError(`Can't update invoice with id of ${id}`, 404);
		}
		return res.send({ invoice: update_Results.rows[0] });
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

/** Routes for industries of biztime app */

const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

// GET /industries listing all industries,
// which should show the company code(s) for that industry
router.get("/", async (req, res, next) => {
	try {
		const results = await db.query(`SELECT i.* , c_i.company_code AS comp_code
        FROM industries AS i
        LEFT JOIN company_industries AS c_i ON i.code = c_i.industry_code`);
		/**
        SELECT i.* , c_i.company_code AS comp_code
        FROM industries AS i
        LEFT JOIN company_industries AS c_i ON i.code = c_i.industry_code;
        */
		console.log("result.rows", results.rows);

		let industries = {};
		for (let i = 0; i < results.rows.length; i++) {
			let row = results.rows[i];
			console.log("row:", row);
            industries[i] = row 
		}
        console.log("Industries Obj:", industries);
		return res.json({ industries: results.rows });
	} catch (e) {
		return next(e);
	}
});

// POST /industries adding an industry

// PUT/PATCH /industries/:code associating an industry to a company

// DELETE /industries/:code

module.exports = router;

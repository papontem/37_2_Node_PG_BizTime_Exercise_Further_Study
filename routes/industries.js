/** Routes for industries of biztime app */

const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

// GET /industries listing all industries,
// which should show the company code(s) for that industry
router.get("/", async (req, res, next) => {
	try {
		let code_list = [];
		const industriesArray = [];
		const query_res = await db.query(`
        SELECT i.code ,i.field , c_i.company_code AS comp_code
        FROM industries AS i
        LEFT JOIN company_industries AS c_i
        ON i.code = c_i.industry_code
        `);

		// lets destructure each row one by one
		for (let i = 0; i < query_res.rows.length; i++) {
			const row = query_res.rows[i];
			const { code, field, comp_code } = row;
			console.log("Current code: ", code);
			console.log("Current field: ", field);
			console.log("Current comp_code: ", comp_code);

			if (!code_list.includes(code)) {
				console.log("NEW CODE!!!");
				code_list.push(code);
			} else {
				console.log("OLD CODE!!!");
				// find the index for the first code, that will
                // be theindexof the industry we
                // need to append a new comp_code to
                
			}
			console.log("code_list:", code_list);
		}
		return res.json({ industries: query_res.rows });
	} catch (e) {
		return next(e);
	}
});

// POST /industries adding an industry

// PUT/PATCH /industries/:code associating an industry to a company

// DELETE /industries/:code

module.exports = router;

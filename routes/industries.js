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
			// console.log("Current code: ", code);
			// console.log("Current field: ", field);
			// console.log("Current comp_code: ", comp_code);

			if (!code_list.includes(code)) {
				// console.log("NEW CODE!!!");
				code_list.push(code);
				industriesArray.push({
					code,
					field,
					companies: [comp_code],
				});
			} else {
				// console.log("OLD CODE!!!");
				let industry_Array_Index = code_list.findIndex(
					(code_element) => code_element === code
				);
				console.log("industry_Array_Index:", industry_Array_Index);
				industriesArray[industry_Array_Index].companies.push(comp_code);
			}
		}
		// console.log("code_list:", code_list);
		// console.log("Industries Array:", industriesArray);

		return res.json({ industries: industriesArray });
	} catch (e) {
		return next(e);
	}
});

//  GET /industries/:code returns industry with matching code
router.get("/:code", async (req, res, next) => {
	try {
		const { code } = req.params;
		const industry_result = await db.query(
			`
        SELECT * 
        FROM industries 
        WHERE code =$1
        `,
			[code]
		);
		if (industry_result.rows.length === 0) {
			throw new ExpressError(`Can't find industry with code of ${code}`, 404);
		}

		const companies_result = await db.query(
			`
        SELECT c.code
        FROM companies AS c
        JOIN company_industries AS c_i
            ON c.code = c_i.company_code
        JOIN industries AS i
            ON c_i.industry_code = i.code
        WHERE i.code = $1;
        `,
			[code]
		);

		let result = industry_result.rows[0];
		result.companies = companies_result.rows.map((row) => row.code);
		return res.json({ industry: result });
	} catch (e) {
		return next(e);
	}
});

// POST /industries adding an industry
router.post("/", async (req, res, next) => {
	try {
		const { code, field} = req.body;
		console.log("Sent code:", code);
		console.log("Sent field:", field);

		// Insert the new industry into the database
		console.log("INSERTING NEW INDUSTRY");
		const insert_results = await db.query(
			"INSERT INTO industries (code, field) VALUES ($1, $2) RETURNING code, field",
			[code, field]
		);

		let result = insert_results.rows[0];
		return res.status(201).json({ industry: result });
	} catch (e) {
		return next(e);
	}
});

// PUT/PATCH /industries/:code updating an industry

// DELETE /industries/:code deleting an industry

module.exports = router;

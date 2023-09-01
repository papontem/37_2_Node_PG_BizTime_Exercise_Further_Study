/** Routes for companies of biztime app */

const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const slugify = require("slugify");
const db = require("../db");

// GET ALL COMPANIES FROM DATABASE
router.get("/", async (req, res, next) => {
	// Making sure to try and catch any error that may occur as
	// we wait the async db.query promise response
	try {
		// PAM: making sql quries db.query(`SQL STRING`)
		console.log("Getting all Companies....");
		const results = await db.query(`SELECT code, name FROM companies`);
		// console.log(results.rows);
		return res.json({ companies: results.rows });
	} catch (e) {
		return next(e);
	}
});

// GET /:code get first company by matching code
router.get("/:code", async (req, res, next) => {
	try {
		const { code } = req.params;
		const comp_results = await db.query(
			"SELECT * FROM companies WHERE code = $1",
			[code]
		);
		if (comp_results.rows.length === 0) {
			throw new ExpressError(`Can't find company with code of ${code}`, 404);
		}
		const invoices_result = await db.query(
			"SELECT id FROM invoices WHERE comp_code = $1",
			[code]
		);
		// console.log(comp_results.rows);
		return res.send({
			company: {
				code: comp_results.rows[0].code,
				name: comp_results.rows[0].name,
				description: comp_results.rows[0].description,
				invoices: invoices_result.rows,
			},
		});
	} catch (e) {
		return next(e);
	}
});

// Slugify rules
// slugify('some string', {
// 	replacement: '-',  // replace spaces with replacement character, defaults to `-`
// 	remove: undefined, // remove characters that match regex, defaults to `undefined`
// 	lower: false,      // convert to lower case, defaults to `false`
// 	strict: false,     // strip special characters except replacement, defaults to `false`
// 	locale: 'vi',      // language code of the locale to use
// 	trim: true         // trim leading and trailing replacement chars, defaults to `true`
//   })

// slugify('..', {replacement: "_", remove: /[*+~.()'"!:@]/g , lower:true,})

router.post("/", async (req, res, next) => {
	try {
		let { code, name, description } = req.body;

		if (!code) {
			code = slugify(name, {
				replacement: "_",
				remove: /[!@#$%^&*()_+,~`.'"}][{|;:@]/g,
				lower: true,
			});
		}

		const results = await db.query(
			"INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description",
			[code, name, description]
		);

		return res.status(201).json({ company: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});

// PUT/PATCH /companies/:code update existing company
router.patch("/:code", async (req, res, next) => {
	try {
		const { code } = req.params;
		const { name, description } = req.body;
		const results = await db.query(
			"UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description",
			[name, description, code]
		);
		if (results.rows.length === 0) {
			throw new ExpressError(`Can't update company with code of ${code}`, 404);
		}
		return res.send({ company: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});

// DELETE /companies/:code delete a company
router.delete("/:code", async (req, res, next) => {
	try {
		const results = await db.query("DELETE FROM companies WHERE code = $1", [
			req.params.code,
		]);
		return res.send({ status: "deleted" });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;

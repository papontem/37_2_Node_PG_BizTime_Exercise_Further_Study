/** TEST FILE FOR INVOICE ROUTES */
// Tell Node that we're in test "mode"
process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testComp;
let testInvoice;

beforeAll(async () => {
	console.log("---------\nBefore All Tests!");
	// make a test company to refecence with invoices
	testComp = {
		code: "invTestComp",
		name: "testCompany",
		description: "a test company with a test description",
	};
	const { code, name, description } = testComp;
	const compResults = await db.query(
		"INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *",
		[code, name, description]
	);
	testComp = compResults.rows[0];

	// console.log("testComp:", testComp);
});

beforeEach(async () => {
	console.log("---------\nBefore Each Test!");
	// Create/Insert a new test invoice from the same test company
	testInvoice = {
		comp_code: testComp.code,
		amt: 100.0,
	};
	const { comp_code, amt } = testInvoice;
	const invResults = await db.query(
		"INSERT INTO invoices ( comp_code, amt ) VALUES ($1, $2) RETURNING *",
		[comp_code, amt]
	);
	testInvoice = invResults.rows[0];
	// console.log("testInvoice:", testInvoice);
});

afterEach(async () => {
	await db.query(`DELETE FROM invoices`);
});

// end the connection of this test file to our db
afterAll(async () => {
	// delete our test company
	await db.query(`DELETE FROM companies`);
	// close db connection
	await db.end();
});

describe("GET /invoices", () => {
	test("Get a list with one invoice", async () => {
		const res = await request(app).get("/invoices");
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({
			invoices: [{ id: testInvoice.id, comp_code: testInvoice.comp_code }],
		});
	});
});

describe("GET /invoices/:id", () => {
	test("Gets a single invoice", async () => {
		const res = await request(app).get(`/invoices/${testInvoice.id}`);
		// console.log("res.body:", res.body);
		// console.log("res.body.invoice:", res.body.invoice);

		// this next few lines are here while i
		// debug as to why during tests date formats are changed into strings...
		// for now were remaking the variables add_date and paid_date into their date type counterparts.
		res.body.invoice.add_date = new Date(res.body.invoice.add_date);
		res.body.invoice.paid_date =
			res.body.invoice.paid_date === null
				? null
				: new Date(res.body.invoice.paid_date);
		// console.log("res.body.invoice.add_date: ", res.body.invoice.add_date);
		// console.log("res.body.invoice.paid_date: ", res.body.invoice.paid_date);

		expect(res.statusCode).toBe(200);

		expect(res.body).toEqual({ invoice: testInvoice });
	});
	test("Responds with 404 for invalid id", async () => {
		const res = await request(app).get(`/invoices/0`);
		expect(res.statusCode).toBe(404);
	});
});

describe("POST /invoices", () => {
	test("Creates a single invoice", async () => {
		let newAmt = testInvoice.amt / 10;
		const res = await request(app)
			.post("/invoices")
			.send({ comp_code: testComp.code, amt: newAmt });
		expect(res.statusCode).toBe(201);
		expect(res.body.invoice.amt).toEqual(newAmt);
		expect(res.body.invoice.comp_code).toEqual(testComp.code);
		expect(res.body.invoice.paid).toEqual(false);
		expect(res.body.invoice.paid_date).toEqual(null);
	});
});

describe("PATCH /invoices/:id", () => {
	test("Updates a single invoice", async () => {
		const res = await request(app)
			.patch(`/invoices/${testInvoice.id}`)
			.send({ amt: 43.11 });
		expect(res.statusCode).toBe(200);
		expect(res.body.invoice.amt).toEqual(43.11);
		expect(res.body.invoice.comp_code).toEqual(testComp.code);
	});
	test("Responds with 404 for invalid id", async () => {
		const res = await request(app).patch(`/invoices/0`).send({ amt: 43.11 });
		expect(res.statusCode).toBe(404);
	});
});
describe("DELETE /invoices/:id", () => {
	test("Deletes a single invoice", async () => {
		const res = await request(app).delete(`/invoices/${testInvoice.id}`);
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ status: "deleted" });
	});
});

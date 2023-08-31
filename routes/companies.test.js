/** TEST FILE FOR COMPANY ROUTES */
// Tell Node that we're in test "mode"
process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testCompany;
let testInv;

beforeEach(async () => {
	console.log("---------\nBefore Each Test!");
	// Create a test company for reference
	testCompany = {
		code: "testComp",
		name: "testCompany",
		description: "a test company with a test description",
	};
	const { code, name, description } = testCompany;
	const compResults = await db.query(
		"INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *",
		[code, name, description]
	);
	testCompany = compResults.rows[0];
	console.log("testCompany:", testCompany);
});

afterEach(async () => {
	await db.query(`DELETE FROM invoices`);
	await db.query(`DELETE FROM companies`);
});

// Close the connection to the test database after all tests
afterAll(async () => {
	await db.query(`DELETE FROM invoices`);
	await db.query(`DELETE FROM companies`);
	await db.end();
});

describe("GET /companies", () => {
	test("Get a list with one company", async () => {
		// console.log("testCompany:",testCompany);
		const res = await request(app).get("/companies");
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({
			companies: [{ code: testCompany.code, name: testCompany.name }],
		});
	});
});

describe("GET /companies/:code", () => {
	test("Gets a single company with empty invoices", async () => {
		const res = await request(app).get(`/companies/${testCompany.code}`);
		expect(res.statusCode).toBe(200);

		expect(res.body).toEqual({
			company: {
				code: testCompany.code,
				name: testCompany.name,
				description: testCompany.description,
				invoices: [],
			},
		});
	});
	test("Gets a single company with a single invoice", async () => {
		testInv = {
			comp_code: testCompany.code,
			amt: 110.011,
		};
		const { comp_code, amt } = testInv;
		const invResults = await db.query(
			"INSERT INTO invoices ( comp_code, amt ) VALUES ($1, $2) RETURNING *",
			[comp_code, amt]
		);
		testInv = invResults.rows[0];
		const res = await request(app).get(`/companies/${testCompany.code}`);
		expect(res.statusCode).toBe(200);

		expect(res.body).toEqual({
			company: {
				code: testCompany.code,
				name: testCompany.name,
				description: testCompany.description,
				invoices: [{ id: testInv.id }],
			},
		});
	});
	test("Responds with 404 for invalid code", async () => {
		const res = await request(app).get(`/companies/0`);
		expect(res.statusCode).toBe(404);
	});
});

describe("POST /companies", () => {
	test("Creates a single company", async () => {
		const newCompany = {
			code: "t&t",
			name: "Test & Test LLC",
			description:
				"A new company description for the test & test llc's company",
		};
		const res = await request(app).post("/companies").send(newCompany);
		
		expect(res.statusCode).toBe(201);
		expect(res.body).toEqual({ company: newCompany });
	});
});

describe("PATCH /companies/:code", () => {
	test("Updates a single company", async () => {
		const updatedCompany = {
			name: "testCompany2",
			description: "NEW AND IMPROVED testCompany ",
		};
		const res = await request(app)
			.patch(`/companies/${testCompany.code}`)
			.send(updatedCompany);
		expect(res.statusCode).toBe(200);
		expect(res.body.company).toEqual({
			code: testCompany.code,
			name: updatedCompany.name,
            description: updatedCompany.description
		});
	});
});

describe("DELETE /companies/:code", () => {
    test("Deletes a single company", async () => {
		const res = await request(app).delete(`/companies/${testCompany.id}`);
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ status: "deleted" });
	});
});

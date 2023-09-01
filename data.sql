DROP DATABASE IF EXISTS biztime;
-- DROP DATABASE IF EXISTS biztime_test;

CREATE DATABASE biztime;
-- CREATE DATABASE biztime_test;

\c biztime
-- \c biztime_test

DROP TABLE IF EXISTS company_industries;
DROP TABLE IF EXISTS industries;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;



CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

-- Add a table for “industries”, where there is a code and an industry field (for example: “acct” and “Accounting”).

CREATE TABLE industries (
    code text PRIMARY KEY,
    field text NOT NULL UNIQUE
);
-- Add a table that allows an industry to be connected to several companies and to have a company belong to several industries.

CREATE TABLE company_industries(
  company_code text NOT NULL REFERENCES companies,
  industry_code text NOT NULL REFERENCES industries,
  PRIMARY KEY(company_code, industry_code)
);

-- commente out the inserts for when you create the test db

INSERT INTO companies (code,name, description)
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.');

INSERT INTO invoices (comp_Code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null);

INSERT INTO industries (code , field)
  VALUES 
    ('CE','Consumer Electronics'),
    ('SS','Software Services'),
    ('OS','Online Services'),
    ('HS','Hardware Services'),
    ('IT','Information Technology');

INSERT INTO company_industries (company_code, industry_code)
  VALUES
    ('apple','CE'),
    ('apple','SS'),
    ('apple','OS'),
    ('apple','IT'),
    ('ibm','HS'),
    ('ibm','IT');


-- test queires.... 

-- SELECT c.*
--   FROM companies AS c
--   JOIN company_industries AS c_i 
--     ON c.code = c_i.company_code
--   JOIN industries AS i 
--     ON c_i.industry_code = i.code
-- WHERE i.code = 'SS';
--  code  |      name      |  description
-- -------+----------------+---------------
--  apple | Apple Computer | Maker of OSX.


-- SELECT c_i.*, i.*, c.*
--   FROM companies AS c
--   JOIN company_industries AS c_i
--     ON c.code = c_i.company_code
--   JOIN industries AS i
--     ON c_i.industry_code = i.code
-- WHERE i.code = 'HS';
--  company_code | industry_code | code |       field       | code | name | description
-- --------------+---------------+------+-------------------+------+------+-------------
--  ibm          | HS            | HS   | Hardware Services | ibm  | IBM  | Big blue.

-- SELECT c_i.*, i.*, c.*
--   FROM companies AS c
--   JOIN company_industries AS c_i
--     ON c.code = c_i.company_code
--   JOIN industries AS i
--     ON c_i.industry_code = i.code
-- WHERE i.code = 'IT';
--  company_code | industry_code | code |         field          | code  |      name      |  description
-- --------------+---------------+------+------------------------+-------+----------------+---------------
--  apple        | IT            | IT   | Information Technology | apple | Apple Computer | Maker of OSX.
--  ibm          | IT            | IT   | Information Technology | ibm   | IBM            | Big blue.
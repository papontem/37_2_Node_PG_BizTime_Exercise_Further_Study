# 37_2_Node_PG_BizTime_Exercise_Further_Study

## Public repo of exercise for unit 37.2: Node PG BizTime Exercise Further Study

We will complete the task of adding routes tests, many-to-many relationship, sligifying company names into codes, and the paying of invoices for our previous simple company/invoice tracker.

## Setting Up

We first need to have a DB with the name of bz created on our Postgresql local server setup, and we will also need a user account that has CRUD Access/Permissions for that DB. You can create a super user if youd like and for this exercise I'm requesting of you to save the username and password for the user who will have acess to that db in your `process.env` object while you are running the app. Since I am using a WSL Ubunto 14 distro, I saved them in my bash profile and i am calling them in my `db.js` file. I also am importing a port variableif youd like to set a custom port for your postgresql server.

Their variable names are:

- PG_USERNAME = "the username of your psql user"
- PG_PASSWORD = "the password of your psql user"
- PGPORT = 5432 <- postgresql uses port 5432 by default, you can manually write this in your db.js

You may edit them as you see fit, or even create a secrets file to write them and import them manually but nevertheless take a look at that file and the `data.sql` file to properly get set up to run the biztime `server.js` with your express.

You can run this command from your terminal to get the databases seeded.

    psql < data.sql

## Route Requests

we'll focus on getting these routes up and running. Later on the next excercise will be when we add jest supertests to them

## /companies

- GET /companies
  - Returns list of companies, like:
  ```js
  {
      companies: [
          {code, name},
          ...
      ]
  }
  ```
- GET /companies/[code]
  - If the company given cannot be found, this should return a 404 status response.
  - Returns obj of company:
  ```js
  {
  	company: {
  		code,
      name,
      description,
      invoices: [ id, ... ]
      industries: [field, ... ]
  	}
  }
  ```
- POST /companies
  - Adds a company.
  - Needs to be given JSON like: `{ name, description ,code}`
  - a value for `code` is optional
  - Returns obj of new company:
  ```js
  {
  	company: {
  		code, name, description;
  	}
  }
  ```
- PUT /companies/[code]
  - Should return 404 if company cannot be found.
  - Needs to be given JSON like: `{name, description}`
  - Returns update company object:
  ```js
  {
  	company: {
  		code, name, description;
  	}
  }
  ```
- DELETE /companies/[code]
  - Deletes company.
  - Should return 404 if company cannot be found.
  - Returns:
  ```js
  {
  	status: "deleted";
  }
  ```

## /invoices

- GET /invoices
  - Return info on invoices like:
  ```js
  {
      invoices: [
          {id,comp_code},
          ...
      ]
  }
  ```
- GET /invoices/[id]

  - If invoice cannot be found, returns 404.
  - Returns obj on given invoice:

  ```js
  {
      invoice: {
          id, amt, paid, add_date, paid_date, company: {code, name, description}
      }
  }
  ```

- POST /invoices

  - Adds an invoice.
  - Needs to be passed in JSON body of: `{comp_code, amt}`
  - Returns:

  ```js
  {
  	invoice: {
  		id, comp_code, amt, paid, add_date, paid_date;
  	}
  }
  ```

- PUT /invoices/[id]

  - Updates an invoice.
  - If invoice cannot be found, returns a 404.
  - Needs to be passed in a JSON body of: `{amt , paid}`
  - Returns:

  ```js
  {
  	invoice: {
  		id, comp_code, amt, paid, add_date, paid_date;
  	}
  }
  ```

- DELETE /invoices/[id]
  - Deletes an invoice.
  - If invoice cannot be found, returns a 404.
  - Returns:
  ```js
  {
  	status: "deleted";
  }
  ```

## /industries

- GET
  - listing all industries, which should show the company code(s) for that industry
  - Returns:
  ```js
  {
    industries:[
      {
        industry: {
          code,
          field,
          companies: [comp_code, ...]
        }
      },
      {industry: ...},
    ]

  }
  ```
- POST
  - adding an industry
- PUT/PATCH
  - associating an industry to a company
- DELETE
  - deleting an industry

## Requirements

You may need to use these tools to run the scripts and run the tests mentioned before.

- [Node](https://nodejs.org/en)
- [Express](https://expressjs.com/)
- [Jest](https://jestjs.io/)
- [Supertest](https://github.com/ladjs/supertest)
- [node-postgres](https://www.npmjs.com/package/pg/v/8.11.3)
- [slugify](https://www.npmjs.com/package/slugify)

## Development

This App was made using a WSL Ubunto 14 distro running from a VS Code desktop environment.
Here are some extensions/modules/tools i use:

- [Prettier](https://prettier.io/) : [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Nodemon](https://www.npmjs.com/package/nodemon)
- [morgan](https://www.npmjs.com/package/morgan)

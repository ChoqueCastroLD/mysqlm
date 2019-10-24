# mysqlm
A.K.A "MySQL Mini" is
A minimalist Nodejs module that will give you improved mysql/mariadb query methods (promised and stream-like)

(It's basically a wrapper of mysql module)

# Setup
Install in your project using npm
> npm install mysqlm --save

Require in your file as
````javascript
const mysqlm = require('mysqlm');
````
# Methods
(All examples will use async await syntax)
## connect 
*connect(config: Object) :Object*

Let's you connect to your database

````javascript
const conn = mysql.connect({
    host: 'localhost',
    user: 'admin',
    password: '12345',
    database: 'mydatabase'
})
````

## query
*query(query: String, input: Array\<String>) :Promise\<result>*

Let's you query your database, returns a promise with result

````javascript
let result = await conn.query('SELECT * FROM pets');

for (const row of result) {
    console.log(row);
}
````

## queryStream
*queryStream(query: String, input: Array\<String>) :Object*

Let's you query your database, returns a object with the a promise method wich will return the result row by row.

Usage Case: You need to get or insert more than 100k rows on one or more tables

````javascript
let stream = conn.queryStream('SELECT * FROM people'); // No need for await here since queryStream doesn't return a promise

// read method does in fact returns a promise so await must be used
await stream.read( (row) => {
    console.log(row);
})

// OR

await conn
.queryStream('SELECT * FROM people')
.read( (row) => {
    console.log(row);
}); // Notice how there are no ; before this, because its a chain of functions

````

## getMysql
*getMysql() :mysql*

Let's you get the mysql module, (same as require('mysql'))

Usage Case: When you need to do something this module doesnt have implemented yet

````javascript
const mysqlm = require('mysqlm');
const mysql = mysqlm.getMysql();

mysql.raw(...);
````
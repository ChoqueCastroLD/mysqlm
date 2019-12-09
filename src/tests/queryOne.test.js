const {DB_HOST, DB_USER, DB_PASSWORD} = require('mandatoryenv').load(["DB_HOST", "DB_USER", "DB_PASSWORD"]);

const mysqlm = require('../index');


test('Query One (insert, select, delete)', async () => {
  const conn = mysqlm.connect({
    host: DB_HOST,
    user: DB_USER,
    database: 'testdb',
    password: DB_PASSWORD
  });

  let {insertId} = await conn.query('INSERT INTO test(name, points) VALUES("Juan", 300)');
  
  let test = await conn.queryOne('SELECT * FROM test');
  
  await conn.query('DELETE FROM test WHERE id = ?', insertId);
  
  expect(Array.isArray(test)).toBe(false);
});
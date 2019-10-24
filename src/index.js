const mysql = require('mysql');
const stream = require('stream');


let pool = null;

/**
 *  Queries the database
 * 
 * @param {String} query - Query string to be executed
 * @param {Array<Object>} input - Input parameters for prepared statements
 */
async function query(query, input) {
    return new Promise((resolve, reject) => {
        pool.query(query, input, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        })
    })
}

async function _rawStream(query = '', input = []) {
    return new Promise((resolve, reject) => {
        try {
            pool.getConnection((err, conn) => {
                if (err) reject(err);
                else {
                    resolve((superCallback) => new Promise((resolver, rechazar) => {
                        conn.query(query, input)
                            .on('error', function (err) {
                                rechazar(err);
                            })
                            .stream()
                            .pipe(
                                new stream.Transform({
                                    objectMode: true,
                                    transform: function (row, encoding, callback) {
                                        superCallback(row);
                                        callback();
                                    }
                                }))
                            .on('finish', function () {
                                resolver(true);
                                connection.end();
                            });
                    }));
                }
            })
        } catch (error) {
            reject(error);
        }
    })
}
/**
 * Example:
 * 
 *  await conn.stream('SELECT * from data').read( row => {
 *     console.log(row);
 *  })
 * 
 * @param {String} query The query to the database
 * @param {Array<String>} input The input values for prepared statements, default is []
 */
function queryStream(query, input = []) {
    return {
        async read(cb) {
            await (await _rawStream(query, input))(row => {
                cb(row);
            });
        }
    }
}

module.exports = {
    connect: (config = {}) => {
        pool = mysql.createPool(config);

        return {
            query,
            queryStream
        }
    },
    getMysql: () => require('mysql')
}
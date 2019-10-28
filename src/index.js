const mysql = require('mysql');
const stream = require('stream');


let pool = null;

async function query(query, input) {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, conn) => {
            if (err) {
                if(conn.destroy) conn.destroy();
                reject(err);
            } else {
                conn.query(query, input, (err, result) => {
                    if(conn.destroy) conn.destroy();
                    if (err) reject(err);
                    else resolve(result);
                })
            }
        });
    })
}

async function _rawStream(query = '', input = []) {
    return new Promise((resolve, reject) => {
        try {
            pool.getConnection((err, conn) => {
                if (err) {
                    if(conn.destroy) conn.destroy();
                    reject(err);
                }else {
                    resolve((superCallback) => new Promise((resolver, rechazar) => {
                        conn.query(query, input)
                            .on('error', function (err) {
                                if(conn.destroy) conn.destroy();
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
                                if(conn.destroy) conn.destroy();
                                resolver(true);
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
    /**
     * Have a .read promise that contains a callback, where every row will be streamed
     */
    return {

        /**
         *  Example:
         * const mystream = conn.stream('SELECT * from data');
         * 
         * await mystream.read((row)=>{
         * 
         *  console.log(row); //print each row
         * 
         * })
         * 
         * @param {Function} callback
         */
        async read(callback) {
            await (await _rawStream(query, input))(row => {
                callback(row);
            });
        }
    }
}

module.exports = {
    /**
     * Returns a connection method, config is the same as mysql
     * example:
     * 
     * mysqlm.connect({
     *  host: 'localhost',
     *  user: 'root',
     *  password: '',
     *  database: 'officedb'
     * })
     */
    connect: (config = {}) => {
        pool = mysql.createPool(config);

        return {
            /**
             *  Queries the database, returns a Promise that resolves in the result
             * 
             * @param {String} query - Query string to be executed
             * @param {Array<Object>} input - Input parameters for prepared statements
             */
            query,
            /**
             *  Queries the database, returns a Object with a stream-like method
             * 
             * @param {String} query - Query string to be executed
             * @param {Array<Object>} input - Input parameters for prepared statements
             */
            queryStream
        }
    },
    /**
     * Returns the mysql module (same as require('mysql'))
     */
    getMysql: () => require('mysql')
}
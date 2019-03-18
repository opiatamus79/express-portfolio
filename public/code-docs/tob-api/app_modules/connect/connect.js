//var dotenv       = require('dotenv').config(); //(need to determine how to put this where app.js is.)

const { Pool, Client } = require('pg');






const pool = new Pool({
	user: 'ggpcdbcgozirlm',
	host: 'ec2-54-197-230-161.compute-1.amazonaws.com',
	database: 'd7nrpvh7df1oh5',
	password: '75074fa916a103f7b81e00191bd51dd7ba1610ca7b445a462ee4a86d13491bbe',
	port: 5432,
  })





const client = new Client({
	connectionString: 'postgresql-graceful-58328', //change this to read from process.env file
	ssl: true,
  });



//db.defaults.poolIdle = 3000;
///////////////////////////////////////////////////////////////////////////////




// EXPORT /////////////////////////////////////////////////////////////////////
module.exports = {
	query: query
};

function query(queryString, queryParams, callback){
	return new Promise((resolve, reject) => {
	console.log(queryParams);
	pool.query(queryString, queryParams,  function(error, result){
		if(error) {
			callback(error, null);
			//return console.error('QUERY ERROR: ', error);
			//reject(error);
		}
		else{
			console.log('Came into query module.');
			callback(null, result);
			//resolve(result);
			//return result;
		}
	});
	//pool.end();
});
}


///////////////////////////////////////////////////////////////////////////////

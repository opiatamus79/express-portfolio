const pgp = require('pg-promise')();


const connection = {
	host: 'ec2-54-197-230-161.compute-1.amazonaws.com',
	port: '5432',
	database: process.env.db_name,
	user: process.env.db_user,
    password: process.env.db_password,
    application_name: process.env.application_name,
    ssl: true,
	max : 5000
}

var db = pgp(connection);

function query(queryString, params) {
	return db.any(queryString,params);
}

function tx(promisesArr) {
    console.log('CAME INTO THE PGP MODULE!')
	if(!promisesArr.length){
		return Promise.reject({error: "First argument must be array of promises."})
	}

	return db.tx(t => {
		return t.batch(promisesArr)
			.then(data =>{
				return data[0];
			})
	})
}

module.exports = {
	query,
	db,
	tx
}
const pgp = require('pg-promise')();


const connection = {
	host: 'ec2-54-197-230-161.compute-1.amazonaws.com',
	port: '5432',
	database: 'd7nrpvh7df1oh5',
	user: 'ggpcdbcgozirlm',
    password: '75074fa916a103f7b81e00191bd51dd7ba1610ca7b445a462ee4a86d13491bbe',
    application_name: 'postgresql-graceful-58328',
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
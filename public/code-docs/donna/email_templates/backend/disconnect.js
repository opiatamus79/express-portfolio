const query = require('../connect/connect').query;
const tx    = require('../connect/connect').tx;
const db    = require('../connect/connect').db;
const joi    = require('joi');
const globals = require('../globals')

/**
 * Returns json object with email template for Disconnect warning emails.
 * @param  {} data bill_id, cid (customer id)
 * @return {}      [description]
 */
function avoidDCWarning(data){
	const schema = joi.object().keys({
        cid : joi.number().integer().required().label('Customer ID'),
		bill_id : joi.number().integer().required().label('Bill ID'),
	});

	return joi.validate(data, schema)
		.then(results => {
            var promise_exists = query(
                'SELECT EXISTS (SELECT true FROM bill WHERE id = $1 AND user_id = $2) AS "exists"',
                 [data.bill_id, data.cid]);
                return tx([promise_exists])
                .then(valid => {
                    if(valid[0].exists === true){
                        const btnStyle = '"background-color: #1c84c6; border-color: #1c84c6; color: #FFFFFF !important; border-radius: 3px; ' +
                        '"font-size: 14px; font-weight: 400; text-align: center; padding: 6px 12px;"'
                    
                        const subject = `${globals.city} - Urgent - Avoid Disconnect Warning`;
                    
                        const message = `<div><h3 style="opacity: 0.6;">${globals.city} - Urgent - Avoid Disconnect Warning</h3><br>\
                        <p>Urgent: Your account is scheduled to be disconnected. Please provide payment as soon as possible to avoid service interruption. </p></div>` + 
                        `<br><br>` + 
                        `<a href=${process.env.FRONTEND_DOMAIN}/bills/${data.bill_id}>` +
                        `<button type="button" style=${btnStyle}>Pay Now</button> </a>` 
            
                        var email = {subject: subject, message: message, email: data.email}
                        return email;

                    }
                    else
                        return valid[0].exists;
                });
        })
}

/**
 * Returns json object with email template for Disconnect warning emails.
 * @param  {} data bill_id, cid (customer id)
 * @return {}      [description]
 */
function DCNotice(data){
	const schema = joi.object().keys({
        cid : joi.number().integer().required().label('Customer ID'),
		bill_id : joi.number().integer().required().label('Bill ID'),
	});

	return joi.validate(data, schema)
		.then(results => {
            var promise_exists = query(
                'SELECT EXISTS (SELECT true FROM bill WHERE id = $1 AND user_id = $2) AS "exists"',
                 [data.bill_id, data.cid]);
                return tx([promise_exists])
                .then(valid => {
                    if(valid[0].exists === true){
                        const btnStyle = '"background-color: #1c84c6; border-color: #1c84c6; color: #FFFFFF !important; border-radius: 3px; ' +
                        '"font-size: 14px; font-weight: 400; text-align: center; padding: 6px 12px;"'
                    
                        const subject = `${globals.city} - Urgent - Disconnect Notice`;
                    
                        const message = `<div><h3 style="opacity: 0.6;">${globals.city} - Urgent - Disconnect Notice</h3><br>\
                        <p>Notice of Disconnect: Your account is scheduled to be disconnected. To avoid service interruption,\
                         please pay your outstanding balance.This is your final warning. </p></div>` + 
                        `<br><br>` + 
                        `<a href=${process.env.FRONTEND_DOMAIN}/bills/${data.bill_id}>` +
                        `<button type="button" style=${btnStyle}>Pay Now</button></a>` 
            
                        var email = {subject: subject, message: message, email: data.email}
                        return email;

                    }
                    else
                        return valid[0].exists;
                });
        })
}
/**
 * Returns json object with email template for Disconnect warning emails.
 * @param  {} data bill_id, cid (customer id)
 * @return {}      [description]
 */
function DCOfficial(data){
	const schema = joi.object().keys({
        cid : joi.number().integer().required().label('Customer ID'),
		bill_id : joi.number().integer().required().label('Bill ID'),
	});

	return joi.validate(data, schema)
		.then(results => {
            var promise_exists = query(
                'SELECT EXISTS (SELECT true FROM bill WHERE id = $1 AND user_id = $2) AS "exists"',
                 [data.bill_id, data.cid]);
                return tx([promise_exists])
                .then(valid => {
                    if(valid[0].exists === true){
                        const btnStyle = '"background-color: #1c84c6; border-color: #1c84c6; color: #FFFFFF !important; border-radius: 3px; ' +
                        '"font-size: 14px; font-weight: 400; text-align: center; padding: 6px 12px;"'
                    
                        const subject = `${globals.city} - Urgent - Official Notice of Disconnect`;
                    
                        const message = `<div><h3 style="opacity: 0.6;">${globals.city} - Urgent - Official Notice of Disconnect</h3><br>\
                        <p>Notice of Disconnect: Your account has been disconnected. Please pay the outstanding balance on your\
                         account to restore service. You can reach our office at: ${globals.phone}</p></div>` + `<br><br>` + `<a href=${process.env.FRONTEND_DOMAIN}/bills/${data.bill_id}>` +
                        `<button type="button" style=${btnStyle}>Pay Now</button></a>` 
            
                        var email = {subject: subject, message: message}
                        return email;

                    }
                    else
                        return valid[0].exists;
                });
        })
}

function reconnect(data){
    const schema = joi.object().keys({
        cid : joi.number().integer().required().label('Customer ID'),
        bill_id : joi.number().integer().required().label('Bill ID'),
    });

    return joi.validate(data, schema)
        .then(results => {
            var promise_exists = query(
                'SELECT EXISTS (SELECT true FROM bill WHERE id = $1 AND user_id = $2) AS "exists"',
                [data.bill_id, data.cid]);
            return tx([promise_exists])
                .then(valid => {
                    if(valid[0].exists === true){
                        const subject = `${globals.city} - Re-Connect Notice`;

                        const message = `<div><h3 style="opacity: 0.6;">${globals.city} - Re-Connect Notice</h3><br>\
                        <p>Your account has been re-connected. Thank you for your payment</p>\
                        </div>` + `<br><br>` + `<a href=${process.env.FRONTEND_DOMAIN}/bills/${data.bill_id}>`
                        var email = {subject: subject, message: message, email: data.email}
                        return email;

                    }
                    else
                        return valid[0].exists;
                });
        })
}

function waterOutageWarning(data){
    const schema = joi.object().keys({
        email: joi.string().required(),
        first_name: joi.string().required(),
        last_name: joi.string().required()
    })

    return joi.validate(data, schema)
        .then((results) => {
            const subject = `${globals.city} - Water Outage Warning`;

            const message = `<div><h3 style="opacity: 0.6;">${globals.city}- Water Outage Warning</h3><br>
                        <p>Dear ${data.first_name} ${data.last_name} we are running into some trouble in your area</p>
                        <p>if you experience issues with your water service please call us or open a suppor ticket</p>
                        </div>`
            var email = {subject: subject, message: message, email: data.email}
            return email;

        })


}

module.exports = {
    avoidDCWarning,
    DCNotice,
    DCOfficial,
    reconnect,
    waterOutageWarning
};
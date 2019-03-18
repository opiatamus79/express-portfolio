const query = require('../connect/connect').query;
const tx    = require('../connect/connect').tx;
const db    = require('../connect/connect').db;
const joi    = require('joi');
const globals = require('../globals');

/**
 * Returns json object with email template for Disconnect warning emails.
 * @param  {} data cid, reason
 * @return {}      [description]
 */
function accountPended(data){
	const schema = joi.object().keys({

        cid : joi.number().integer().required().label('Customer ID'),
        reason: joi.string().required().label('Reason for Pend')
	});

	return joi.validate(data, schema)
		.then(results => {
            var promise_exists = query(
                'SELECT EXISTS (SELECT true FROM users WHERE id = $1) AS "exists"',
                 [data.cid]);
                return tx([promise_exists])
                .then(valid => {
                    if(valid[0].exists === true){
                        const btnStyle = '"background-color: #1c84c6; border-color: #1c84c6; color: #FFFFFF !important; border-radius: 3px; ' +
                        '"font-size: 14px; font-weight: 400; text-align: center; padding: 6px 12px;"'
                    
                        const subject = `${globals.city} - Pending Account Registration`;
                    
                        const message = `<div><h3 style="opacity: 0.6;">${globals.city} - Pending Account Registration</h3><br>
                        <p>Your account registration has been pended. Reason for Pend:<br> ${data.reason}.<br><br> 
                        If you have any questions you can submit a support ticket or reach us at our office.<br><br>
                        Customer Service Support:<br>Phone: ${globals.phone}<br>Email: ${globals.cityContactEmail}<br>Address: ${globals.city} ${globals.address}</p></div>` + 
                        '<br><br>' + 
                        `<a href=http://cityofdonna.org/contact/>` +
                        `<button type="button" style=${btnStyle}>Contact Support</button> </a>` 
            
                        var email = {subject: subject, message: message}
                        return email;

                    }
                    else
                        return valid[0].exists;
                });
        })
}

function accountActivated(data){
	const schema = joi.object().keys({

        cid : joi.number().integer().required().label('Customer ID')
	});

	return joi.validate(data, schema)
		.then(results => {
            var promise_exists = query(
                'SELECT EXISTS (SELECT true FROM users WHERE id = $1) AS "exists"',
                 [data.cid]);
                return tx([promise_exists])
                .then(valid => {
                    if(valid[0].exists === true){
                        const btnStyle = '"background-color: #1c84c6; border-color: #1c84c6; color: #FFFFFF !important; border-radius: 3px; ' +
                        '"font-size: 14px; font-weight: 400; text-align: center; padding: 6px 12px;"'
                    
                        const subject = `${globals.city} - Account Activation`;
                    
                        const message = `<div><h3 style="opacity: 0.6;">${globals.city} - Account Activation</h3><br>
                        <p>Your ${globals.city} online account has been activated.
                        You may use this portal at your convenience to pay your bills, view your account summary, and submit support tickets.
                        </p></div>` + '<br><br>' + 
                        `<a href=${process.env.FRONTEND_DOMAIN}/profile/>` +
                        `<button type="button" style=${btnStyle}>My Account</button> </a>` 

                        var email = {subject: subject, message: message}
                        return email;

                    }
                    else
                        return valid[0].exists;
                });
        })
}

function newAccount(){

    return new Promise((resolve, reject) => {
        const btnStyle = '"background-color: #1c84c6; border-color: #1c84c6; color: #FFFFFF !important; border-radius: 3px; ' +
        '"font-size: 14px; font-weight: 400; text-align: center; padding: 6px 12px;"'
                        
        const subject = `${globals.city} - New Account Registration`;
                        
        const message = `<div><h1 style="opacity: 0.6;">New Account Registration</h1><br>
        <p>We have received your account registration. The benefits of the online portal are: pay your bill online, view your account statements,
        get in contact with your local government, submit support tickets. We will notify you when your account has been created.
        </p></div>`
                
        var email = {subject: subject, message: message}
        resolve(email);
    });
           
       
}

function rejectedAccount(data) {
    return new Promise((resolve, reject) => {
        const btnStyle = '"background-color: #1c84c6; border-color: #1c84c6; color: #FFFFFF !important; border-radius: 3px; ' +
            '"font-size: 14px; font-weight: 400; text-align: center; padding: 6px 12px;"'

        const subject = `${globals.city} - New Account Registration Rejection`;

        const message = `<div><h1 style="opacity: 0.6;">New Account Registration Rejection</h1><br>
        <p>We have received your account registration and processed your request but unfortunately it has been rejected for the following reasons:<br><br> ${data.feedback}
        </p></div>`

        var email = { subject: subject, message: message }
        resolve(email);
    });

}

module.exports = {
    accountPended,
    accountActivated,
    newAccount,
    rejectedAccount

};
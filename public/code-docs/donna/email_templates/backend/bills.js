const query = require('../connect/connect').query;
const tx    = require('../connect/connect').tx;
const db    = require('../connect/connect').db;
const joi    = require('joi');
const moment = require('moment');
const globals = require('../globals');

/**
 * Returns json object with email template for Disconnect warning emails.
 * @param  {} data cid, bill id
 * @return {}      [description]
 */
function outstandingBill(data){
	const schema = joi.object().keys({
        cid : joi.number().integer().required().label('Customer ID'),
        bill_id: joi.number().integer().required().label('Bill ID')
	});

	return joi.validate(data, schema)
		.then(results => {
            var promise_exists = query(
                'SELECT EXISTS (SELECT true FROM bill WHERE id = $1 AND user_id = $2) AS "exists"',
                 [data.bill_id, data.cid]);
                return tx([promise_exists])
                .then(valid => {
                    if(valid[0].exists === true){
                        var promise = query(
                            'SELECT b.due_date, b.amount, u.email from bill b JOIN users u ON b.user_id = u.id  where b.id = $1 and b.user_id = $2',
                             [data.bill_id, data.cid]);
                             return tx([promise])
                             .then(results =>{
                                var amount = parseFloat(results[0].amount).toFixed(2);
                                const btnStyle = '"background-color: #1c84c6; border-color: #1c84c6; color: #FFFFFF !important; border-radius: 3px; ' +
                                '"font-size: 14px; font-weight: 400; text-align: center; padding: 6px 12px;"'
                            
                                const subject = `${globals.city} - Urgent - Outstanding Bill`;
                            
                                const message = `<div><h3 style="opacity: 0.6;">${globals.city}- Urgent - Outstanding Bill <${data.bill_id}></h3><br>
                                <p><strong>Your bill is past due. Please make payment to avoid service interruption and late fees.</strong><br>
                                <strong>Your total bill amount is: $${amount}.</strong><br><br> 
                                You may click on the link below to make an online payment. You may also deliver to us via mail, or in person your payment.
                                Please note, we require your payment on or before the bill due date.<br><br>Thank you,<br><br>
                                Customer Service Support:<br>Phone: ${globals.phone}<br>Email: ${globals.cityContactEmail}<br>
                                Address: ${globals.city} ${globals.address}</p></div>` + 
                                '<br><br>' + 
                                `<a href=${process.env.FRONTEND_DOMAIN}/bills/${data.bill_id}>` +
                                `<button type="button" style=${btnStyle}>Pay Now</button> </a>` 
                    
                                var email = {subject: subject, message: message, to: [results[0].email]}
                                return email;
                             });     
                    }
                    else
                        return valid[0].exists;
                });
        })
}


function billStatement(data){
	const schema = joi.object().keys({
        cid : joi.number().integer().required().label('Customer ID'),
        bill_id: joi.number().integer().required().label('Bill ID')
	});

	return joi.validate(data, schema)
		.then(results => {
            var promise_exists = query(
                'SELECT EXISTS (SELECT true FROM bill WHERE id = $1 AND user_id = $2) AS "exists"',
                 [data.bill_id, data.cid]);
                return tx([promise_exists])
                .then(valid => {
                    if(valid[0].exists === true){
                        var promise = query(
                            'SELECT b.due_date, b.amount, u.email from bill b JOIN users u ON b.user_id = u.id  where b.id = $1 and b.user_id = $2',
                             [data.bill_id, data.cid]);
                             return tx([promise])
                             .then(results =>{
                                var date = (results[0].due_date.getMonth() + 1) + '/' + results[0].due_date.getDate() + '/' + results[0].due_date.getFullYear();
                                var amount = parseFloat(results[0].amount).toFixed(2);
                                const btnStyle = '"background-color: #1c84c6; border-color: #1c84c6; color: #FFFFFF !important; border-radius: 3px; ' +
                                '"font-size: 14px; font-weight: 400; text-align: center; padding: 6px 12px;"'
                            
                                const subject = `${globals.city} - Bill Statement`;
                                
                                const message = `<div><h3 style="opacity: 0.6;">${globals.city} - Bill Statement <${data.bill_id}></h3><br>
                                <p>Your bill statement is available. Your bill is due on ${date}. We appreciate your prompt payment.<br>
                                Your total bill amount is: $${amount}.<br><br> 
                                You may click on the link below to make an online payment. You may also deliver to us via mail, or in person your payment.
                                Please note, we require your payment on or before the bill due date.<br><br>Thank you,<br><br>
                                Customer Service Support:<br>Phone: ${globals.phone}<br>Email: ${globals.cityContactEmail}<br>
                                Address: ${globals.city} ${globals.address}</p></div>` + 
                                '<br><br>' + 
                                `<a href=${process.env.FRONTEND_DOMAIN}/bills/${data.bill_id}>` +
                                `<button type="button" style=${btnStyle}>Pay Now</button> </a>` 
                                var email = {subject: subject, message: message, to: [results[0].email]}
                                return email;
                             });     
                    }
                    else
                        return valid[0].exists;
                });
        })
}

function depositBill(data){
	const schema = joi.object().keys({
        cid : joi.number().integer().required().label('Customer ID'),
        bill_id: joi.number().integer().required().label('Bill ID')
	});

	return joi.validate(data, schema)
		.then(results => {
            var promise_exists = query(
                'SELECT EXISTS (SELECT true FROM bill WHERE id = $1 AND user_id = $2) AS "exists"',
                 [data.bill_id, data.cid]);
                return tx([promise_exists])
                .then(valid => {
                    if(valid[0].exists === true){
                        var promise = query(
                            'SELECT b.due_date, b.amount, u.email from bill b JOIN users u ON b.user_id = u.id  where b.id = $1 and b.user_id = $2',
                             [data.bill_id, data.cid]);
                             return tx([promise])
                             .then(results =>{
                                var date = (results[0].due_date.getMonth() + 1) + '/' + results[0].due_date.getDate() + '/' + results[0].due_date.getFullYear();
                                var amount = parseFloat(results[0].amount).toFixed(2);
                                const btnStyle = '"background-color: #1c84c6; border-color: #1c84c6; color: #FFFFFF !important; border-radius: 3px; ' +
                                '"font-size: 14px; font-weight: 400; text-align: center; padding: 6px 12px;"'
                            
                                const subject = `${globals.city} - Deposit Bill`;
                                
                                const message = `<div><h3 style="opacity: 0.6;">${globals.city} - Deposit Bill<${data.bill_id}></h3><br>
                                <p>Attached is a copy of the bill that is due. Please make payment on or before ${date}.
                                Pay your bill online, come in and pay, send us your payment.<br><br>
                                Your total deposit fee is: $${amount}.<br><br> 
                                Customer Service Support:<br>Phone: ${globals.phone}<br>Email: ${globals.cityContactEmail}<br>
                                Address: ${globals.city} ${globals.address}</p></div>` + 
                                '<br><br>' + 
                                `<a href=${process.env.FRONTEND_DOMAIN}/bills/${data.bill_id}>` +
                                `<button type="button" style=${btnStyle}>Pay Now</button> </a>` 
                    
                                var email = {subject: subject, message: message, to:[results[0].email]};
                                return email;
                             });     
                    }
                    else
                        return valid[0].exists;
                });
        })
}

function billReminder(data){
	const schema = joi.object().keys({
        cid : joi.number().integer().required().label('Customer ID'),
        bill_id: joi.number().integer().required().label('Bill ID')
	});

	return joi.validate(data, schema)
		.then(results => {
            var promise_exists = query(
                'SELECT EXISTS (SELECT true FROM bill WHERE id = $1 AND user_id = $2) AS "exists"',
                 [data.bill_id, data.cid]);
                return tx([promise_exists])
                .then(valid => {
                    if(valid[0].exists === true){
                        var promise = query(
                            'SELECT b.due_date, b.amount, u.email from bill b JOIN users u ON b.user_id = u.id  where b.id = $1 and b.user_id = $2',
                             [data.bill_id, data.cid]);
                             return tx([promise])
                             .then(results =>{
                                var date = (results[0].due_date.getMonth() + 1) + '/' + results[0].due_date.getDate() + '/' + results[0].due_date.getFullYear();
                                var amount = parseFloat(results[0].amount).toFixed(2);
                                const btnStyle = '"background-color: #1c84c6; border-color: #1c84c6; color: #FFFFFF !important; border-radius: 3px; ' +
                                '"font-size: 14px; font-weight: 400; text-align: center; padding: 6px 12px;"'
                            
                                const subject = `${globals.city} - Bill Reminder`;
                            
                                const message = `<div><h3 style="opacity: 0.6;">${globals.city} - Bill Reminder <${data.bill_id}></h3><br>
                                <p>Your bill due date is near. Your bill is due on ${date}.<br> We appreciate your prompt payment.<br>
                                Your total bill amount is: $${amount}.<br><br> 
                                You may click on the link below to make an online payment. You may also deliver to us via mail, or in person your payment.
                                Please note, we require your payment on or before the bill due date.<br><br>Thank you,<br><br>
                                Customer Service Support:<br>Phone: ${globals.phone}<br>Email: ${globals.cityContactEmail}<br>
                                Address: ${globals.city} ${globals.address}</p></div>` + 
                                '<br><br>' + 
                                `<a href=${process.env.FRONTEND_DOMAIN}/bills/${data.bill_id}>` +
                                `<button type="button" style=${btnStyle}>Pay Now</button> </a>` 
                    
                                var email = {subject: subject, message: message,to:[results[0].email]}
                                return email;
                             });     
                    }
                    else
                        return valid[0].exists;
                });
        })
}

function paymentReceipt(data){
	const schema = joi.object().keys({
        cid : joi.number().integer().required().label('Customer ID'),
        payment_id: joi.number().integer().required().label('Payment ID')
	});

	return joi.validate(data, schema)
		.then(results => {
            
            var promise_exists = query(
                'SELECT EXISTS (SELECT true FROM payment WHERE id = $1 AND user_id = $2) AS "exists"',
                 [data.payment_id, data.cid]);
                return tx([promise_exists])
                .then(valid => {
                    if(valid[0].exists === true){

                        const qry = `SELECT P.*, row_to_json(B) AS bill, row_to_json(A) AS account, row_to_json(I) AS user_info, row_to_json(PD) AS pds_info, row_to_json(MA) AS mailing_address, row_to_json(SA) AS service_address,  U.email
                        FROM payment P 
                        LEFT JOIN users U ON P.user_id = U.id
                        LEFT JOIN bill B ON P.bill_id = B.id
                        LEFT JOIN account A ON P.account_id = A.id
                        LEFT JOIN address MA ON A.mailing_address_id = MA.id
                        LEFT JOIN address SA ON A.service_address_id = SA.id
                        LEFT JOIN user_info I ON P.user_id = I.user_id
                        LEFT JOIN pds_info PD ON P.id = PD.payment_id
                        WHERE P.user_id = $1 AND P.id = $2`;

                        var promise = query(qry, [data.cid, data.payment_id]);
                             return tx([promise])
                             .then(results =>{
                                const payment = results[0];
                                var amount = parseFloat(payment.amount).toFixed(2);
                                const btnStyle = '"background-color: #1c84c6; border-color: #1c84c6; color: #FFFFFF !important; border-radius: 3px; ' +
                                '"font-size: 14px; font-weight: 400; text-align: center; padding: 6px 12px;"'
                            
                                const subject = `${globals.city} - Payment Receipt`;
                                
                                const message = `<div><h3 style="opacity: 0.6;">${globals.city} - Payment Receipt</h3><br>
                                <p>Thank you for your payment of $${amount}. Below is your payment receipt. 
                                You can access your payment activity by logging into your account.</p></div>` + 
                                '<br><br>' + 

                                `<div class="ibox float-e-margins">` +
                                    `<div class="ibox-content">` +
                                        `<div class="row" style="text-align: center">` +
                                            `<div class="col-md-12">` +
                                            `<h2>${globals.city}</h2>` +
                                            `<h3>${globals.address}</h3>` +
                                            `</div>` +
                                        `</div>` +

                                        `<div class="row">` +
                                            `<div style="text-align: center">`+
                                            `<hr class="divider">` +
                                                `<h3>Payment Receipt</h3>`+
                                                `<hr class="divider">` +
                                            `</div>`+
                                        `</div>`+

                                        `<div class="row">`+
                                            `<table width="100%">` +
                                                `<thead>` +
                                                    `<th>` +
                                                        `<td> </td>`+
                                                        `<td> </td>`+
                                                    `</th>` +
                                                `</thead>` +
                                                `<tbody>` +
                                                    `<tr>` +
                                                        `<td width="50%" style="text-align: right"><strong>Payment To: </strong></td>`+
                                                        `<td width="50%" >${globals.city}</td>`+
                                                    `</tr>` +
                                                    `<tr>` +
                                                        `<td width="50%" style="text-align: right"><strong>Payment For: </strong></td>`+
                                                        `<td width="50%" >Water Utilities</td>`+
                                                    `</tr>` +
                                                    `<tr>` +
                                                        `<td width="50%" style="text-align: right"><strong>Account Number: </strong></td>`+
                                                        `<td width="50%" >${payment.account.incode_account_no || 'DEPOSIT'}</td>`+
                                                    `</tr>` +
                                                    `<tr>` +
                                                        `<td width="50%" style="text-align: right"><strong>Name: </strong></td>`+
                                                        `<td width="50%" >${payment.user_info.first_name}</td>`+
                                                    `</tr>` +
                                                    `<tr>` +
                                                        `<td width="50%" style="text-align: right"><strong>Service Address: </strong></td>`+
                                                        `<td width="50%" >${payment.service_address.street_address}, ${payment.service_address.city}, ${payment.service_address.state}, ${payment.service_address.zip_code}</td>`+
                                                    `</tr>` +
                                                    `<tr>` +
                                                        `<td width="50%" style="text-align: right"><strong>Date: </strong></td>`+
                                                        `<td width="50%" >${moment(payment.date_created).format('MMMM d, YYYY')}</td>`+
                                                    `</tr>` +
                                                    `<tr>` +
                                                        `<td width="50%" style="text-align: right"><strong>Time: </strong></td>`+
                                                        `<td width="50%" >${moment(payment.date_created).format('h:mm a')}</td>`+
                                                    `</tr>` +
                                                    `<tr>` +
                                                        `<td width="50%" style="text-align: right"><strong>Transaction ID: </strong></td>`+
                                                        `<td width="50%" >${payment.pds_info.confirmation_id}</td>`+
                                                    `</tr>` +
                                                    `<tr>` +
                                                        `<td width="50%" style="text-align: right"><strong>Payment Amount: </strong></td>`+
                                                        `<td width="50%" >$${parseFloat(payment.pds_info.amount).toFixed(2) || 'N/A'}</td>`+
                                                    `</tr>` +
                                                    `<tr>` +
                                                        `<td width="50%" style="text-align: right"><strong>Service Fee: </strong></td>`+
                                                        `<td width="50%" >$${parseFloat(payment.amount - payment.pds_info.amount).toFixed(2) || 'N/A'}</td>`+
                                                    `</tr>` +
                                                    `<tr>` +
                                                        `<td width="50%" style="text-align: right"><strong>Total Amount: </strong></td>`+
                                                        `<td width="50%" >$${parseFloat(payment.amount).toFixed(2) || 'N/A'}</td>`+
                                                    `</tr>` +
                                                `</tbody>` +
                                            `<table>` +
                                        `</div>`+

                                        `<div class="row p-sm">` +
                                            `<div class="col-md-12">`+
                                            `<div style="border-color: #ddd;    
                                                padding: 10px 15px;
                                                border-bottom: 1px solid transparent;
                                                border-top-left-radius: 3px;
                                                border-top-right-radius: 3px;
                                                margin-bottom: 20px;
                                                background-color: #fff;
                                                border: 1px solid transparent;
                                                border-radius: 4px;">`+
                                                `<div class="row">` +
                                                `<div class="col-md-12">`+
                                                `<strong> Please Note: </strong>`+
                                                `</div>`+
                                                `</div>`+
                                                `<div class="row">`+
                                                `<div class="col-md-12">`+
                                                `The payment amount charged on your statement will be notated by the words:`+
                                                ` <strong>Water Utilities</strong>` +
                                                `</div>`+
                                                `</div>`+
                                            `</div>`+
                                            `</div>`+
                                        `</div>`+
                                        `<hr>`+

                                        `<div class="row">` +
                                            `<div class="col-md-12" style="text-align: center">`+
                                            `<p>Thank you for your payment!</p>`+
                                            `<p>If you have any questions regarding your transaction you may call City of ${globals.onlyCityName} at ${globals.phone} during our business hours of 8:00 am to 5:00 pm Central Standard Time, Monday through Friday.</p>`+
                                            `</div>`+
                                        `</div>`+
                                    `</div>` +
                                `</div> <br>`+

                                `<a href=${process.env.FRONTEND_DOMAIN}/profile/>` +
                                `<button type="button" style=${btnStyle}>My Account</button> </a>` 
                    
                                var email = {subject: subject, message: message}
                                return email;
                             });     
                    }
                    else
                        return valid[0].exists;
                });
        })
}


module.exports = {
    outstandingBill,
    billStatement,
    depositBill,
    billReminder,
    paymentReceipt

};
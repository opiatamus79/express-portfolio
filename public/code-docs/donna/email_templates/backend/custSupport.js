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
function supportTicket(data){
	const schema = joi.object().keys({
        cid : joi.number().integer().required().label('Customer ID'),
        ticket_id: joi.number().integer().required().label('Ticket ID')
	});

	return joi.validate(data, schema)
		.then(results => {
            var promise_exists = query(
                'SELECT EXISTS (SELECT true FROM ticket WHERE id = $1 AND user_id = $2) AS "exists"',
                 [data.ticket_id, data.cid]);
                return tx([promise_exists])
                .then(valid => {
                    if(valid[0].exists === true){
                        var promise = query(
                            'SELECT * from ticket where id = $1 and user_id = $2',
                             [data.ticket_id, data.cid]);
                             return tx([promise])
                             .then(results =>{
                                var appendedDetails = [];

                                for(var i in results[0].details){
                                appendedDetails.push([results[0].details [i]]);
                                }

                                const btnStyle = '"background-color: #1c84c6; border-color: #1c84c6; color: #FFFFFF !important; border-radius: 3px; ' +
                                '"font-size: 14px; font-weight: 400; text-align: center; padding: 6px 12px; margin-bottom:3px;"'

                               const images = results[0].details.images.map((image) => {
                                 return `<a href="${image}" style="margin: 5px;"> <img width="100" height="100" class="max-width" border="red 1px solid"  src="${image}"/></a>`
                               })

                                const subject = `${globals.city} - Support Ticket`;

                                const message = `<div><h3 style="opacity: 0.6;">${globals.city} - Support Ticket<${data.ticket_id}></h3><br>
                                <p>You opened a support ticket with the City Of ${globals.onlyCityName}.<br> Information Provided for the ticket:<br> Ticket Details - "${appendedDetails}"<br><br>
                                 We will get back to you in the next 72hrs. Thank you,</p></div>` + '<br><br>' +
                                `<a href=${process.env.FRONTEND_DOMAIN}/tickets/${data.ticket_id}>` +
                                `<button type="button" style=${btnStyle}>View Ticket</button> </a> <br>` +images


                                var email = {subject: subject, message: message}
                                return email;
                             });
                    }
                    else
                        return valid[0].exists;
                });
        })
}

function ticketReceievedRes(data){
	const schema = joi.object().keys({
        cid : joi.number().integer().required().label('Customer ID'),
        ticket_id: joi.number().integer().required().label('Ticket ID')
    });
    
	return joi.validate(data, schema)
		.then(results => {     
            var promise_exists = query(
                'SELECT EXISTS (SELECT true FROM ticket WHERE id = $1 AND user_id = $2) AS "exists"',
                 [data.ticket_id, data.cid]);
                return tx([promise_exists])
                .then(valid => {
                    if(valid[0].exists === true){
                        var promise = query(
                            'SELECT * from ticket where id = $1 and user_id = $2',
                             [data.ticket_id, data.cid]);
                             return tx([promise])
                             .then(results =>{
                                const btnStyle = '"background-color: #1c84c6; border-color: #1c84c6; color: #FFFFFF !important; border-radius: 3px; ' +
                                '"font-size: 14px; font-weight: 400; text-align: center; padding: 6px 12px;"'

                                const subject = `${globals.city} - Support Ticket Comment`;

                                const message = `<div><h3 style="opacity: 0.6;">${globals.city} - Support Ticket Comment</h3><br>
                                <p>Your ticket <${data.ticket_id}> has received a response. Please login to your account in order to respond.<br>
                                Below is a link referencing to your ticket <${data.ticket_id}>.</p></div>` + '<br><br>' +
                                `<a href=${process.env.FRONTEND_DOMAIN}/tickets/${data.ticket_id}>` +
                                `<button type="button" style=${btnStyle}>View Ticket</button> </a>`

                                var email = {subject: subject, message: message}
                                return email;
                             });
                    }
                    else
                        return valid[0].exists;
                });
        })
}

function statusChange(data){
	const schema = joi.object().keys({
        cid : joi.number().integer().required().label('Customer ID'),
        ticket_id: joi.number().integer().required().label('Ticket ID')
	});

	return joi.validate(data, schema)
		.then(results => {
            var promise_exists = query(
                'SELECT EXISTS (SELECT true FROM ticket WHERE id = $1 AND user_id = $2) AS "exists"',
                 [data.ticket_id, data.cid]);
                return tx([promise_exists])
                .then(valid => {
                    if(valid[0].exists === true){
                        var promise = query(
                            'SELECT * from ticket where id = $1 and user_id = $2',
                             [data.ticket_id, data.cid]);
                             return tx([promise])
                             .then(results =>{

                                var promise_status = query(
                                    'SELECT * from ticket_status where id = $1',
                                     [results[0].ticket_status_id]);
                                     return tx([promise_status])
                                     .then(status =>{
                                         console.log(status);
                                         console.log(status[0].name);
                                        const btnStyle = '"background-color: #1c84c6; border-color: #1c84c6; color: #FFFFFF !important; border-radius: 3px; ' +
                                        '"font-size: 14px; font-weight: 400; text-align: center; padding: 6px 12px;"'

                                        const subject = `${globals.city} - Support Ticket - ${status[0].name}`;

                                        const message = `<div><h3 style="opacity: 0.6;">${globals.city}- Support Ticket - ${status[0].name}</h3><br>
                                        <p>Your ticket <${data.ticket_id}> status has changed. It is in <strong>"${status[0].name}"</strong> status.
                                        Below is a reference to the ticket for your records. You can also login to your account to view the status of your support tickets.</p></div>` + '<br><br>' + 
                                        `<a href=${process.env.FRONTEND_DOMAIN}/tickets/${data.ticket_id}>` +
                                        `<button type="button" style=${btnStyle}>View Ticket</button> </a>`

                                        var email = {subject: subject, message: message}
                                        return email;

                                     });
                             });
                    }
                    else
                        return valid[0].exists;
                });
        })
}


function guestSupportTicket(data, customerCopy){
    const subject = `${globals.city} - Support Ticket`;

    let message = `<div><h3 style="opacity: 0.6;">${globals.city} - Support Ticket</h3><br>
    <p>The following support ticket was received by the City Of Donna.<br> Information Provided for the ticket:<br> Ticket Details - <br>"${getObjectPropertiesAsParagraphs(data.details)}"<br><br>
     We will get back to you in the next 72hrs. Thank you,</p></div>` + '<br><br>'
    message = customerCopy ? `<h1>Client Copy</h1><br>${message}`:message
    var email = {subject: subject, message: message}
    return email;
}

function getObjectPropertiesAsParagraphs(object){
    return Object.keys(object).reduce((htmlString, property) => {
        return object[property] != null && object[property] != '' &&
            `${htmlString}<br><p>${property} = ${object[property]}</p>` ||
                htmlString
    },'')
}



module.exports = {
    supportTicket,
    ticketReceievedRes,
    statusChange,
    guestSupportTicket
};

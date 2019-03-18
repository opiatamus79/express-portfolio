const query = require('../connect/connect').query;
const tx    = require('../connect/connect').tx;
const db    = require('../connect/connect').db;
const joi    = require('joi');
const globals = require('../globals')

/**
 * Returns json object with email template for Disconnect warning emails.
 * @param  {} data wid
 * @return {}      [description]
 */
function newWorkOrder(data){
    // console.log("Data: ", data);
	const schema = joi.object().keys({
        id: joi.number().integer().required().label('Work Order ID'),
        assigned_to : joi.string().required().label('Assigned to'),
        priority : joi.string().required().label('Priority'),
        description : joi.string().required().label('Description'),
        title : joi.string().required().label('Title'),
	});

	return joi.validate(data, schema)
		.then(results => {
            var promise_exists = query(
                'SELECT EXISTS (SELECT true FROM work_order  WHERE id = $1) AS "exists"',
                 [data.id]);
                return tx([promise_exists])
                .then(valid => {
                    if(valid[0].exists === true){
                        var promise = query(
                            `SELECT * from work_order wo
                                    JOIN work_order_type wot ON wo.work_order_type_id = wot.id
                                    JOIN department dep ON wot.department_id = dep.id
                                    where wo.id = $1`,
                             [data.id]);
                             return tx([promise])
                             .then(results =>{
                                const details = results[0].details;
                                var appendedDetails = [];

                                for(var i in results[0].details){
                                    appendedDetails.push([results[0].details [i]]);
                                }
                                const btnStyle = '"background-color: #1c84c6; border-color: #1c84c6; color: #FFFFFF !important; border-radius: 3px; ' +
                                '"font-size: 14px; font-weight: 400; text-align: center; padding: 6px 12px;"'
                            
                                const subject = `${globals.city} - New Work Order`;

                                const detailsMessage = `<ul> <li> Title: ${details.title} </li> <li> Description: ${details.description} </li> <li> Priority: ${details.priority} </li> <li> Assigned To: ${details.assigned_to} </li> </ul>`
                                
                                const message = `<div><h3 style="opacity: 0.6;">${globals.city} - New Work Order <${data.id}></h3><br>
                                <p>A new work order <${data.id}> has been created.<br> Here are the details for the work order: ${detailsMessage}<br>
                                Here are the notes for the work order: ${results[0].notes || "N/A"}<br><br>
                                You can review the new work order with the link provided.</p></div>` + 
                                '<br><br>' + 
                                `<a href=${process.env.FRONTEND_DOMAIN}/work_orders/${data.id}>` +
                                `<button type="button" style=${btnStyle}>View Work Order</button> </a>` 
                    
                                var email = {subject: subject, message: message, email: data.assigned_to}
                                return email;
                             });     
                    }
                    else
                        return valid[0].exists;
                });
        })



}


module.exports = {
    newWorkOrder

};
const query = require('../connect/connect').query;
const tx    = require('../connect/connect').tx;
const joi   = require('joi');
const Comm	= require('./../helpers/communicationFunctions.js');
const globals = require('../globals')


function resetPasswordNotice(data){
    const schema = joi.object().keys({
        email : joi.string().required().label('Email'),
        last_update_days  : joi.number().required(),
        id  : joi.number().required()
    });

    return joi.validate(data,schema)
        .then(results => {
            const subject = `${globals.city} - Password Notice`;

            const message = `<p>You are receiving this email because your password is ${data.last_update_days} from expiration.</p>
                <p>Please remember to reset your password</p>`

            const emailData = {
                from 	: globals.cityContactEmail,
                to 		: [data.email],
                subject : subject,
                message : message
            }

            return Comm.sendEmail(emailData);
        })

}

function invalidatedLoginNotice(data){
        const subject = `${globals.city} - Password Notice`;

        const btnStyle = '"background-color: #1c84c6; border-color: #1c84c6; color: #FFFFFF !important; border-radius: 3px; ' +
            '"font-size: 14px; font-weight: 400; text-align: center; padding: 6px 12px;"'

        const message = `<p>You are receiving this email because your password is expired.</p>
            <p>In order to login to the platform please hit the reset button on the Login section</p>`+
            `<a href=${process.env.FRONTEND_DOMAIN}` +
            `<button type="button" style=${btnStyle}> Reset Password</button> </a>`;

        const emailData = {
            from 	: globals.cityContactEmail,
            to 		: [data.email],
            subject : subject,
            message : message
        }

        return Comm.sendEmail(emailData);


}



module.exports = {
    resetPasswordNotice,
    invalidatedLoginNotice
};
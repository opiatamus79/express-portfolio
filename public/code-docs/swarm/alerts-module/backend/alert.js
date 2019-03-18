const Model = require('../model');

function update(update, data) {
	console.log('HERE IS WHERE notification is getting updated:', data)
    return update(
        ['subject', 'message', 'variables', 'status_req', 'feedback_req', 'alert_settings_id'],
        [data.subject, data.message, data.variables, data.statusReq, data.feedbackReq, data.alertSettingsId]
    );
}

function create(create,data) {
    return create(
        ['date_created','subject', 'message', 'variables', 'status_req', 'feedback_req', 'alert_settings_id'],
        ['now()',data.subject, data.message, data.variables, data.statusReq, data.feedbackReq, data.alertSettingsId]
    )
}

module.exports = {
    model: () => new Model('alert_notification', create, update)
};

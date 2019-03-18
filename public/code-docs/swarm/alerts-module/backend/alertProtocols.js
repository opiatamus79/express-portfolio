const Model = require('../model');

function update(update, data) {
    return update(
        ['email', 'sms', 'push', 'call', 'inapp_notification', 'target_user', 'target_usergroup', 'primary_email'],
        [data.email, data.sms, data.push, data.call, data.inapp_notification, data.target_user, data.target_usergroup, data.primary_email]
    );
}

function create(create,data) {
    return create(
        ['date_created','email', 'sms', 'push', 'call', 'inapp_notification', 'target_user', 'target_usergroup', 'primary_email'],
        ['now()', data.email, data.sms, data.push, data.call, data.inapp_notification, data.target_user, data.target_usergroup, data.primary_email]
    )
}

module.exports = {
    model: () => new Model('alert_protocol', create, update)
};

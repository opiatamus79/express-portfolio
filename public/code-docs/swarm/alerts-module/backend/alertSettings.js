const Model = require('../model');

function update(update, data) {
    return update(
        ['name', 'enabled', 'last_date_enabled', 'priority', 'timestamp_source', 'display_path'
            ,'ack_mode','ack_notes','archiving_allowed','type','variable','limits','rate_limit','start_date', 'end_date', 'alert_protocol_id'],
        [data.name, data.enabled, data.lastDateEnabled, data.priority, data.timestampSource, data.displayPath,
            data.ackMode,data.ackNotes,data.archivingAllowed,data.type,data.variable,data.limits, data.rateLimit, data.start_date, data.end_date, data.alertProtocolId]
    );
}

function create(create,data) {
    return create(
        ['date_created','name', 'enabled', 'last_date_enabled', 'priority', 'timestamp_source', 'display_path'
            ,'ack_mode','ack_notes','archiving_allowed','type','variable','limits','rate_limit','start_date', 'end_date','alert_protocol_id'],
        ['now()',data.name, data.enabled, data.lastDateEnabled, data.priority, data.timestampSource, data.displayPath,
            data.ackMode,data.ackNotes,data.archivingAllowed,data.type,data.variable,data.limits, data.rateLimit, data.start_date, data.end_date, data.alertProtocolId]
    )
}

module.exports = {
    model: () => new Model('alert_settings', create, update)
};

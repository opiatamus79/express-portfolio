const alertPTypeService = require('./alert_priority_type');

module.exports = function(){
    return alertPTypeService.model()
            .select()
            .get()
}
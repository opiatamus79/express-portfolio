let alertSettingsService = require('./alertSettings')
let alertNotificationService =  require('./alert');
let transformer          = require('./../../transformers/alertSettings');
const alertNotificationTransformer = require('./../../transformers/alertNotification');
let Model                = require('./../model');
function alertEntityInsert(entity){
    return (req,res) => {
        alertSettingsService.model()
            .create(req.body)
            .first()
            .then((newlyCreatedAlert) => {
                return modelFactory(entity).create({id: newlyCreatedAlert.id, entityId: req.params.id}).first()
                    .then(() => {
                        //res.status(200).jsonData(transformer(newlyCreatedAlert))
                        var notification = {
                        variables: " ",
                        subject: newlyCreatedAlert.name,
                        message: "*Description*",
                        statusReq: true,
                        feedbackReq: true,
                        alertSettingsId: newlyCreatedAlert.id
                        }
                        return alertNotificationService.model()
                            .create(notification)
                            .first()
                            .then((newlyCreatedNotification) => {
                                //res.status(200).jsonData(alertNotificationTransformer(newlyCreatedNotification));
                                res.status(200).jsonData(transformer(newlyCreatedAlert))
                                return newlyCreatedNotification
                            })
                    })
            })
            .catch((e) => {
                console.log(e);
                res.status(500).jsonMessage(e)
            })
    }
}

function checkExistenceAndPermissions(){
    return (req,res,next) => {
        let {permissions} = req.user;
        return alertSettingsService.model()
            .select()
            .join('alert_settings_zone','id','id', 'LEFT')
            .join('alert_settings_node','id','id', 'LEFT')
            .join('alert_settings_hub','id','id', 'LEFT')
            .join('alert_settings_sensor','id','id', 'LEFT')
            .whereEquals('alert_settings.id', req.params.id)
            .get()
            .then((result) => {
                console.log(result);
                let {id_zone, id_node, id_sensor, id_hub} = result[0];
                switch (true) {
                    case id_zone != null:
                        return permissions.some(permission => permission.name === "alert_settings_node_update") ?
                            next():
                            res.status(403).jsonMessage("You don't have permission to use this component");
                    case id_node != null:
                        return permissions.some(permission => permission.name === "alert_settings_node_update") ?
                            next():
                            res.status(403).jsonMessage("You don't have permission to use this component");
                    case id_hub != null:
                        return permissions.some(permission => permission.name === "alert_settings_node_update") ?
                            next():
                            res.status(403).jsonMessage("You don't have permission to use this component");
                    case id_sensor != null:
                        return permissions.some(permission => permission.name === "alert_settings_node_update") ?
                            next():
                            res.status(403).jsonMessage("You don't have permission to use this component");
                    default:
                        return res.status(403).jsonMessage("You don't have permission to use this component");
                }
            })
    }
}


function modelFactory(entity){
    return new Model(`alert_settings_${entity}`,(create,data) => create(
            ['id', `id_${entity}`],
            [data.id, data.entityId]
        )
    )
}

module.exports = {
    alertEntityInsert,
    checkExistenceAndPermissions
};

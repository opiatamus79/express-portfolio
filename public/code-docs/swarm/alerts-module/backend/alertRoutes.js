const router = require('express').Router();
let alertNotificationService =  require('../app_modules/alert/alert');
let alertSettingsService =  require('../app_modules/alert/alertSettings');
let alertProtocolsService =  require('../app_modules/alert/alertProtocols');
const alertNotificationTransformer = require('../transformers/alertNotification');
const alertSettingsTransformer= require('../transformers/alertSettings');
const alertSettProtocolsTransformer= require('../transformers/alertSettProtocol');
const alertProtocolsTransformer= require('../transformers/alertProtocols');
const pagination = require('../middlewares/pagination');
const filters = require('../middlewares/filters');
const validation = require('../middlewares/validation');
const updateNotificationsSchema= require('../validations/alerts/updateNotifications.js');
const updateSettingsSchema= require('../validations/alerts/updateSettings.js');
const updateProtocolsSchema= require('../validations/alerts/updateProtocols')
const createSettingsSchema = require('../validations/alerts/createSettings');
const createNotificationSchemas = require('../validations/alerts/createNotifications');
const createProtocolSchema= require('../validations/alerts/createProtocols');
const {checkExistenceAndPermissions} = require('../app_modules/alert/alertSettingsFactory');
const entityExists = require('../middlewares/entityExists');
const createAlert = require('../app_modules/gis/arcgis/requests/createAlert');
const updateAlert = require('../app_modules/gis/arcgis/requests/updateAlert');
const deleteAlert = require('../app_modules/gis/arcgis/requests/deleteAlert');
const ArcGis    = require('../app_modules/gis/arcgis/ArcGis');
const generateToken   = require('../app_modules/gis/arcgis/requests/generateToken');
const gisTransformer  = require('../transformers/gis').alert
const alertOwner      = require('../app_modules/alert/alertOwner');
const alertTypes      = require('../app_modules/alert/alertTypes');
const alertPTypes      = require('../app_modules/alert/alertPTypes');
const nodeCoordinates = require('../app_modules/nodes/coordinates');
const zoneCoordinates = require('../app_modules/zones/coordinates');
const hubCoordinates  = require('../app_modules/hubs/coordinates');



router.get('/notifications', pagination(),(req, res) =>{
    alertNotificationService.model()
        .selectWithCount('count', 'alert_settings.*, alert_notification')
        .join('alert_settings','alert_settings_id', 'id')
        .orderBy('alert_notification.date_created DESC ')
        .paginate(req.skip, req.limit)
        .get()
        .then(function(alerts) {
            let count = alerts[0]? alerts[0].count: 0;

            return res.status(200)
                .paginate(count, req)
                .jsonData(alerts.map(alert => (
                    {...alertSettingsTransformer(alert), ...alertNotificationTransformer(alert) }
                )));
        });
});
router.get('/notifications/:alertSettingsId',(req, res) =>{ 
    alertNotificationService.model()
        .findBy('alert_settings_id', req.params.alertSettingsId)
        .first()
        .then(function(notification) {
            return res.status(200)
                .jsonData(alertNotificationTransformer(notification));
        });
});

router.get('/types', pagination(), (req, res) =>{
        return alertTypes().then(result =>{  
            return result && res.status(200).jsonData(result);
        })
});

router.get('/ptypes', pagination(), (req, res) =>{
    return alertPTypes().then(result =>{  
        return result && res.status(200).jsonData(result);
    })
});

router.get('/settings',pagination(), (req,res) => {
    alertSettingsService.model()
        .selectWithCount()
        .paginate(req.skip,req.limit)
        .get()
        .then((alerts) =>{
            let count = alerts[0]? alerts[0].count: 0;
            return res.status(200)
                .paginate(count, req)
                .jsonData(alerts.map(alert=> alertSettingsTransformer(alert)));
        })
})

router.get('/settings/protocols',filters(['type']), pagination(), (req,res) => {
    alertProtocolsService.model()
        .selectWithCount()
        .join(alertSettingsService.model().table(), 'id', 'alert_protocol_id')
        .whereLike(req.filters)
        .orderBy('alert_settings.id')
        .paginate(req.skip,req.limit)
        .get()
        .then((alerts) =>{
            let count = alerts[0]? alerts[0].count: 0;

            return res.status(200)
                .paginate(count, req)
                .jsonData(alerts.map(alert => (
                    {...alertSettProtocolsTransformer(alert), ...alertSettingsTransformer(alert) }
                )));
        })
})

// router.get('/settings/protocols',filters(['type']), pagination(), (req,res) => {
//     alertProtocolsService.model()
//         .selectWithCount()
//         .join(alertSettingsService.model().table(), 'id', 'alert_protocol_id')
//         .get()
//         .then((alerts) =>{
//             let count = alerts[0]? alerts[0].count: 0;

//             return res.status(200)
//                 .paginate(count, req)
//                 .jsonData(alerts.map(alert => (
//                     {...alertSettProtocolsTransformer(alert), ...alertSettingsTransformer(alert) }
//                 )));
//         })
// })



router.get('/protocols',pagination(), (req,res) => {
        alertProtocolsService.model()
        .selectWithCount()
        .paginate(req.skip,req.limit)
        .get()
        .then((protocol) =>{
            let count = protocol[0]? protocol[0].count: 0;
            return res.status(200)
                .paginate(count, req)
                .jsonData(protocol.map(protocol=> alertSettProtocolsTransformer(protocol)));
        })
})
//createSettingsSchema 
/*router.post('/settings',validation(createSettingsSchema ), (req,res) => {
    console.log('CAME IN HERE TO CREATE ALERT.');
    console.log(req.body);
    alertSettingsService.model()
        .create(req.body)
        .first()
        .then((newlyCreatedAlert) => {
            res.status(200).jsonData(alertSettingsTransformer(newlyCreatedAlert));
            return newlyCreatedAlert
        })
})*/
router.post('/protocols',validation(createProtocolSchema), (req,res) => {
    alertProtocolsService.model()
        .create(req.body)
        .first()
        .then((newlyCreatedProtocol) => {
            res.status(200).jsonData(alertProtocolsTransformer(newlyCreatedProtocol));
            return newlyCreatedProtocol
        })
})

router.put('/notifications/:id' , validation(updateNotificationsSchema), (req,res) => {
    alertNotificationService.model()
    .find(req.params.id)
    .first()
    .then(function(notification) {
        return notification || res.status(404).jsonMessage('alert notification not found');
    })
    .then(function(notification) {
        if(!notification) return notification;
        return alertNotificationService.model().update(notification.id, req.body).first()
    })
    .then(function(notification) {
        return notification && res.status(200).jsonData(alertNotificationTransformer(notification));
    })
})

//Be sure to mention to Kike and Andres that these routes and method checkExistenceAndPermissions() will need
//to be updated to handle multiple ids, it is not yet decided how to handle multiple ids in these tables
//and how to update based on change of alert type.
router.put('/protocols/:id', checkExistenceAndPermissions(), validation(updateProtocolsSchema), (req,res) => {
    console.log('Came in to update protocol')
    alertProtocolsService.model()
    .find(req.params.id)
    .first()
    .then(function(protocol) {
        return protocol || res.status(404).jsonMessage('Protocol not found');
    })
    .then(function(protocol) {
        if(!protocol) return protocol;
        return alertProtocolsService.model().update(protocol.id, req.body).first()
    })
    .then(function(protocol) {
        return protocol && res.status(200).jsonData(alertProtocolsTransformer(protocol));
    })
})

router.put('/settings/:id', checkExistenceAndPermissions() ,validation(updateSettingsSchema) , (req,res) => {
    console.log('CAME IN HERE TO UPDATE ALERT')
    alertSettingsService.model()
        .find(req.params.id)
        .first()
        .then(function(alert) {
            return alert || res.status(404).jsonMessage('Alert not found');
        })
        .then(function(alert) {
            if(!alert) return alert;
            return alertSettingsService.model().update(alert.id, req.body).first()
        })
        .then(function(alert) {
            return alert && res.status(200).jsonData(alertSettingsTransformer(alert));
        })
});



router.delete('/notifications/:id', entityExists(alertNotificationService), (req,res) => {
        return alertNotificationService.model()
            .delete(req.params.id)
            .first()
            .then(function() {
                return res.status(200).jsonData('Alert Notification deleted successfully');
            })
            .then(() => {
                return ArcGis.withoutAuth().request(generateToken, require('../app_modules/gis/arcgis/requests/tokenBody'))
                    .then(({token}) => {
                        return ArcGis.withToken(token).request(deleteAlert,{objectIds: req.params.id} )
                    })
            })

});

router.delete('/settings/:id', (req,res) => {
    alertSettingsService.model()
        .find(req.params.id)
        .first()
        .then(alert => alert || res.status(404).jsonMessage('Notification not found'))
        .then(function(alert) {
            return alertSettingsService.model().delete(alert.id).first();
        })
        .then(function() {
            return res.status(200).jsonData('Alert setting deleted successfully');
        });
})








module.exports = router;


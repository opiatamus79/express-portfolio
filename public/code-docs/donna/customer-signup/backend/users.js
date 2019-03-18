var express        = require('express');
var router         = express.Router();
var users          = require('../helpers/userFunctions');
const {idsSent, isUser, isUserInfo, isUserSettings, isUpdatingUser, isAdminUserInfo}   = require('../helpers/validationFunctions');
const {logMiddlewareFactory,logError, logUpdateBefore, logUpdateAfter} = require('../helpers/logFunctions');

/* GET Routes. */
router.get('/', (req,res) => {
    if (
        req.query.page 
        || req.query.limit 
        || req.query.search
        || req.query.type
    ){
        users.getFilteredUsers(req.query)
            .then( results => {
                results.length != 0 &&
                res.status(200).json(results) ||
                res.status(404).json({})
            })
            .catch(error => {
                error.isJoi &&
                res.status(400).json({ message: "Please check the data sent", error: error })
                res.status(500).json({ error: error })
            })
    } else {
        users.getUsers()
            .then(results => {
                results.length != 0 &&
                    res.status(200).json(results) ||
                    res.status(404).json({})
            })
            .catch(error => {
                res.status(500).json({ error: error })
                logError(error);
            })
    }
}).get('/:id',idsSent ,(req,res) => {
    var uid = req.params.id;
    users.getUserWith(uid)
        .then(results => {
            results.length != 0 &&
            res.status(200).json(results[0]) ||
            res.status(404).json({})
        }).catch(error => {
            res.status(500).json({error : error})
            logError(error);
        })
}).get('/:id/settings', idsSent ,(req,res) => {
    var uid = req.params.id;
    users.getSettingsWith(uid)
        .then(results => {
            results.length != 0 &&
            res.status(200).json(results[0]) ||
            res.status(404).json({})
        }).catch(error => {
            console.log("error: ", error);
            res.status(500).json({error : error})
            logError(error);
        })
}).get('/:id/info',idsSent ,(req,res) => {
    var uid = req.params.id;
    users.getInfoWith(uid)
        .then(results => {
            results.length != 0 &&
            res.status(200).json(results[0]) ||
            res.status(404).json({})
        }).catch(error => {
            res.status(500).json({error : error})
            logError(error);
        })
}).get('/:id/accounts', idsSent, (req, res) => {
    var uid = req.params.id;
    users.getAccountsWith(uid)
        .then( results => {
            results.length != 0 &&
            res.status(200).json(results) ||
            res.status(404).json({})
        })
        .catch(error => {
            console.log("error: ", error);
            res.status(500).json({error : error});
            logError(error);
        })
}).get('/:id/account_type',(req,res) => {
    users.getEmailsByAccountType(req.params)
        .then(results => {
            res.status(200).json(results[0].array_agg)
        })
        .catch(error => {
            res.status(500).json({error : error});
        })
}).get('/incode/:incode_account_no',(req, res) => {
    users.getIncodeData(req.params)
        .then(results => {
            if(results.success){
                res.status(200).json(results.response);
            } else if(!results.success && results.errorMessage){
                res.status(400).json({message: results.errorMessage})
            }else{
                res.status(400).json({message: "Could not find account in Incode"})
            }
        })
        .catch(error => {
            console.log("error: ", error);
            res.status(500).json({error: error})
        })
}).get('/by/zipcode',(req,res) => {
    users.getUsersByZipcode(req.query)
        .then(results => {
            res.status(200).json(results[0].array_agg)
        })
        .catch(error => {
            res.status(500).json({error : error});
        })
});

router.post('/', isUser, (req,res, next)=> {
    if (req.user && req.user.userType == 1) {
        users.createAdminOrStaffUser(req.body)
            .then(results => {
                results.length != 0 &&
                res.status(200).json(results[0]) ||
                res.status(404).json({});
                next()
            }).catch(error => {
                error.exists &&
                res.status(422).json({message: 'User already exists!'}) ||
                res.status(500).json({error: error})
                logError(error);
        })
    } else {
        res.status(403).json({message: "forbidden"});
    }
}, logMiddlewareFactory('CreateUser'));

router.delete('/:id',idsSent, (req,res,next) => {
    var id = req.params.id;
    if(req.user && req.user.userType == 1){
        users.deleteUser(id)
            .then(results => {
                if(results.length == 0){
                    res.status(404).json({})
                }else{
                    res.status(200).json({success:true});
                    req.body = results;
                    next();
                }
            })
            .catch(error => {
                logError(error);
                res.status(500).json({error});
            })
    }else{
        res.status(403).json({message: "forbidden"});
    }
}, logMiddlewareFactory('DeleteUser'));

router.put('/:id',
    idsSent,
    isUpdatingUser,
    logUpdateBefore('users','UpdateUser'),
    (req, res, next) => {
    var id= req.params.id;
    var user = Object.assign({},req.body,{id});
    users.updateUser(user)
        .then(results => {
            if(results.length == 0){
                res.status(404).json({})
            }else{
                res.status(200).json({success:true})
                req.body = results[0];
                next()
            }
        })
        .catch(error => {
            res.status(500).json({error});
            logError(error);
        })
}, logUpdateAfter());


router.put('/:id/settings',
    idsSent,
    isUserSettings,
    logUpdateBefore('user_settings', 'UpdateUserSettings'),
    (req,res,next) => {
    var user_id = req.params.id;
    var userSettings = Object.assign({},req.body,{user_id});
    users.updateUserSettings(userSettings)
        .then(results => {
            if(results.rowCount == 0){
                res.status(404).json({})
            }else{
                res.status(200).json({success:true})
                req.body = results.rows[0];
                next()
            }
        })
        .catch(error => {
            res.status(500).json({error});
            logError(error);
        })
}, logUpdateAfter());




router.put('/:id/info',
    idsSent,
    isUserInfo,
    logUpdateBefore('user_info', 'UpdateUserInfo'),
    (req, res, next) => {
    var user_id = req.params.id;
    var userInfo = Object.assign({},req.body,{user_id});
    users.updateUserInfo(userInfo)
        .then(results => {
            if(results.rowCount == 0){
                res.status(404).json({})
            }else{
                res.status(200).json({success:true})
                req.body = results.rows[0];
                next()
            }
        })
        .catch(error => {
            res.status(500).json({error});
            logError(error);
        })
}, logUpdateAfter());

router.put('/:id/info/admin',
    idsSent,
    isAdminUserInfo,
    logUpdateBefore('user_info', 'UpdateUserInfo'),
    (req, res, next) => {
    var user_id = req.params.id;
    var userInfo = Object.assign({},req.body,{user_id});
    users.updateAdminUserInfo(userInfo)
        .then(results => {
            if(results.rowCount == 0){
                res.status(404).json({})
            }else{
                res.status(200).json({success:true})
                req.body = results.rows[0];
                next()
            }
        })
        .catch(error => {
            res.status(500).json({error});
            logError(error);
        })
}, logUpdateAfter());

module.exports = router;
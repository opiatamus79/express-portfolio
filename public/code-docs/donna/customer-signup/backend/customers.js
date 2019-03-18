var express        = require('express');
var router         = express.Router();
const {idsSent}    = require('../helpers/validationFunctions');
const customers    = require('../helpers/customerFunctions');
const tickets = require('../helpers/ticketFunctions');
const request      = require('request');
const belongsToCustomer = require('../middleware/belongsToCustomer');
const {logMiddlewareFactory,logError, logUpdateBefore, logUpdateAfter} = require('../helpers/logFunctions');
const {AWSFileUploadWithParams,setOp} = require('../helpers/fileUploaderFunctions');
const [TICKET_CREATED_TEMPLATE, TICKET_UPDATED_TEMPLATE, TICKET_COMMENT_TEMPLATE] = ["supportTicket", "statusChange" ,"ticketReceievedRes"];

router.get('/', idsSent, (req,res) => {
    customers.getCustomers()
        .then(results => {
            results.length != 0 &&
            res.status(200).json(results) ||
            res.status(404).json({})
        }).catch(error => {
            res.status(500).json({error : error})
            logError(error)
        })
}).get('/:id', idsSent, (req,res) => {
    var uid = req.params.id;
    customers.getCustomerWith(uid)
        .then(results => {
            results.length != 0 &&
            res.status(200).json(results[0]) ||
            res.status(404).json({})
        }).catch(error => {
            res.status(500).json({error : error})
            logError(error)
        })
}).get('/:id/dashboard/:aid', idsSent, (req,res) => {
    var uid = req.params.id;
    var aid = req.params.aid;
    customers.getCustomerDashInfoWith(uid, aid)
        .then(results => {
            results.length != 0 &&
            res.status(200).json(results) ||
            res.status(404).json({})
        }).catch(error => {
            res.status(500).json({error : error})
            logError(error)
        })
}).get('/:id/settings', idsSent, (req,res) => {
    var uid = req.params.id;
    customers.getCustomerSettingsWith(uid)
        .then(results => {
            results.length != 0 &&
            res.status(200).json(results[0]) ||
            res.status(404).json({})
        }).catch(error => {
            res.status(500).json({error : error})
            logError(error)
        })
}).get('/:cid/info',idsSent, (req,res) => {
    var cid = req.params.cid;
    customers.getCustomerInfoWith(cid)
        .then(results => {
            results.length != 0 &&
            res.status(200).json(results[0]) ||
            res.status(404).json({})
        }).catch(error => {
            res.status(500).json({error: error})
            logError(error)
        })
}).get('/:cid/accounts/:aid',idsSent, (req,res) => {
    var cid = req.params.cid;
    var aid = req.params.aid;
    customers.getCustomerAccountWith(cid, aid)
        .then(results => {
            results.length != 0 &&
            res.status(200).json(results[0]) ||
            res.status(404).json({})
        }).catch(error => {
            res.status(500).json({error: error})
            logError(error)
        })
}).get('/:id/accounts', idsSent, (req,res) => {
    var uid = req.params.id;
    customers.getAllCustomerAccounts(uid)
        .then(results => {
            results.length != 0 &&
            res.status(200).json(results) ||
            res.status(404).json({})
        }).catch(error => {
            res.status(500).json({error : error})
            logError(error)
        })
}).get('/:id/bills', idsSent, (req,res) => {
    var uid = req.params.id;
    customers.getCustomerBillsWith(uid, req.query)
        .then(results => {
            res.status(200).json(results)
        }).catch(error => {
            console.log("ero: ", error)
            res.status(500).json({error : error})
            logError(error)
        })
}).get('/:id/bills/:bid',idsSent, belongsToCustomer('bid', 'bill'), (req,res) => {
    customers.getCustomerBill(req.params)
        .then(results => {
            // console.log("Results: ", results);
            results.length != 0 &&
            res.status(200).json(results[0]) ||
            res.status(404).json({})
        }).catch(error => {
            console.log("ero: ", error)
            res.status(500).json({error : error})
            logError(error)
        })
}).get('/:id/payments', idsSent, (req,res) => {
    var user_id = req.params.id;
    customers.getPaymentsWith(user_id, req.query)
        .then(results => {
            res.status(200).json(results);
        }).catch(error => {
            res.status(500).json({error : error})
            logError(error)
        })
}).get('/:id/payments/:pid', idsSent, belongsToCustomer('pid', 'payment'),  (req,res) => {
    var user_id = req.params.id;
    var payment_id = req.params.pid;
    customers.getCustomerPayment(user_id, payment_id)
        .then(results => {
            results.exists &&
            res.status(200).json(results.data) ||
            res.status(404).json({ error: 'Payment not found' });
        }).catch(error => {
            res.status(500).json({error : error})
            logError(error)
        })
}).get('/:id/tickets/:tid/comments', idsSent, (req,res) => {
    var user_id = req.params.id;
    var ticket_id = req.params.tid;
    customers.getCustomerTicketCommentsBy(user_id, ticket_id)
        .then(results => {
            results.exists &&
            res.status(200).json(results.data) ||
            res.status(404).json({ error: 'Comments not found' })
        }).catch(error => {
            res.status(500).json({error : error})
            logError(error)
        })
}).get('/:id/tickets/:tid', idsSent, belongsToCustomer('tid', 'ticket'), (req,res) => {
    var user_id = req.params.id;
    var ticket_id = req.params.tid;
    customers.getACustomerTicketBy(user_id, ticket_id)
        .then(results => {
            results.exists &&
            res.status(200).json(results.data) ||
            res.status(404).json({ error: 'Ticket not found' })
        }).catch(error => {
            res.status(500).json({ error : error })
            logError(error)
        })
}).get('/:cid/tickets/', idsSent, (req,res) => {
    var user_id = req.params.cid;
    if (
        req.query.page
        || req.query.limit
        || req.query.search
        || req.query.ticket_status
        || req.query.ticket_type
    ) {
        customers.getFilteredCustomerTicketsBy(user_id, req.query)
            .then(results => {
                results.exists &&
                res.status(200).json(results.data) ||
                res.status(404).json({ error: 'Customer does not exist' })
            }).catch(error => {
                error.isJoi &&
                res.status(400).json({ message: "Please check the data sent", error: error }) ||
                res.status(500).json({ error: error })
                logError(error);
            })
    } else {
        customers.getCustomerTicketsBy(user_id)
            .then(results => {
                results.exists &&
                res.status(200).json(results.data) ||
                res.status(404).json({ error: 'Customer does not exist' })
            }).catch(error => {
                res.status(500).json({ error: error })
                logError(error);
            })
    }
}).get('/:cid/bills/:bid/ebill/:month/:year', idsSent, (req,res) => {
    var {cid, bid,month, year} = req.params;
    customers.retrieveEbillFromIncode(cid,bid)
        .then(customerExists => {
            customerExists &&
            request(`https://s3.amazonaws.com/donna.water.department/ebills/user${cid}bill${bid}${month}${year}`).pipe(res) ||
            res.status(404).json({error:'Bill or customer does not exist'});
        })
        .catch(error => {
            res.status(500).json({error})
        })
});

/** POST routes */

router.post('/:cid/tickets', idsSent,setOp('tickets'), AWSFileUploadWithParams, (req,res,next) => {
    req.body.details = JSON.parse(req.body.details);
    req.body.details.images = req.files.map(file => file.location);
    delete req.body.files;

    customers.createTicket(req.body, req.params.cid)
        .then(results => {
            if(results.length == 0)
                return results;
            tickets.getUserAndSendEmailTicket(results[0].id, results[0].user_id, TICKET_CREATED_TEMPLATE)
            return results
        })
        .then(results => {
            if(!results){
                console.log('May not have provided valid user/customer id, account id, or ticket type id.');
                res.status(404).json([]);
              }
              else
                res.status(200).json(results);
                next()
        }).catch(error => {
            if(error.isJoi){
                res.status(400).json({error: error.details[0].message})
            }
            else if(error.statusCode){
                res.status(error.statusCode).json({error : error.errorMessage})
            }
            else{
                console.log("error: ", error);
                res.status(500).json({error : error})
                logError(error)
            }
        })
}, logMiddlewareFactory('CreateTicketCustomer'));



router.post('/:cid/tickets/:tid/comments', idsSent, (req,res,next) => {
    customers.postComment(req.body, req.params.cid, req.params.tid)
        .then(results => {
            if(results.length == 0)
                return results;
            tickets.getUserAndSendEmailTicket(results[0].ticket_id, results[0].user_id, TICKET_COMMENT_TEMPLATE)
            return results;
        })
        .then(results => {
            if(!results){
                console.log('May not have provided valid user/customer id or ticket id.');
                res.status(404).json([]);
              }
              else{
                res.status(200).json(results[0]);
            }
        }).catch(error => {
            console.log(error);
            if(error.isJoi){
                res.status(400).json(error.details[0].message)
            }
            else if(error.statusCode){
                res.status(error.statusCode).json({error : error.errorMessage})
            }
            else{
                console.log("error: ", error);
                res.status(500).json({error : error})
                logError(error)
            }
        })
},logMiddlewareFactory('CreateCommentOnTicketCustomer'));


router.post('/:cid/payments', idsSent, (req, res, next) => {
    customers.makePayment(req.body, req.params.cid)
        .then(results => {
            if (!results) {
                console.log('May not have provided valid customer id, account id, bill id, or amount');
                res.status(404).json([]);
            }
            else {
                res.status(200).json(results);
                next()
            }
        }).catch(error => {
            if (error.isJoi) {
                res.status(400).json(error.details[0].message)
            }
            else if (error.statusCode) {
                res.status(error.statusCode).json({ error: error.errorMessage })
            }
            else {
                console.log("error: ", error);
                res.status(500).json({ error: error })
                logError(error)
            }
        })
}, logMiddlewareFactory('CreatePaymentCustomer'));

router.post('/nowater/:zip', idsSent, (req,res,next) => {
    if(req.user && (req.user.userType == 1 || req.user.userType == 2)) {
        customers.waterOutageCommunicate(req.params.zip)
            .then((result) => {
                if (result) {
                    res.status(200).json({result})
                } else {
                    res.status(404).json({message: "No users found in the zip sent"});
                }
            })
    }else{
        res.status(403).json({message: "forbidden"});
    }
})

/** PUT routes*/
router.put('/:cid/tickets/:tid',
    idsSent,
    setOp('tickets'),
    AWSFileUploadWithParams,
    logUpdateBefore('ticket', 'UpdateCustomerTicket'),
    (req, res, next) => {
        req.body.details = JSON.parse(req.body.details);
        req.body.details.images = req.body.details.images.concat(req.files.map(file => file.location));
        delete req.body.files;

        customers.updateCustomerTicket(req.params.cid, req.params.tid, req.body)
            .then( results => {
                req.body = results[0];
                results &&
                res.status(200).json(results.data) ||
                res.status(404).json('Ticket not found')
            })
            .catch( error => {
                console.log("error: ", error);
                res.status(500).json({error : error})
                logError(error)
            })
    },
    logUpdateAfter()
);

router.put('/:cid/settings',
    idsSent,
    logUpdateBefore('user_settings','UpdateCustomerSettings'),
    (req,res,next) => {
    const user_id = parseInt(req.params.cid);
    const changedSettings  = Object.assign({},req.body,{user_id});
    customers.updateCustomerSettings(changedSettings)
        .then(results => {
            if(results.length != 0){
                req.body = results[0];
                res.status(200).json(results);
                next()
            }else
                res.status(404).json({})
        }).catch(error => {
            res.status(500).json({error : error})
            logError(error)
        })
}, logUpdateAfter());

router.put('/:cid/info',
    idsSent,
    logUpdateBefore('user_info','UpdateCustomerInfo'),
    (req,res) => {
    const user_id = parseInt(req.params.cid);

    customers.updateCustomerInfo(req.body, user_id)
        .then(results => {
            if(!results){
                console.log('May not have provided valid customer id (user id).');
                res.status(404).json([]);
              }
              else
                res.status(200).json(results);
        }).catch(error => {
            if(error.isJoi){
                res.status(400).json(error.details[0].message)
            }
            else if(error.statusCode){
                res.status(error.statusCode).json({error : error.errorMessage})
            }
            else{
                console.log("error: ", error);
                res.status(500).json({error : error})
                logError(error)
            }
        })
}, logUpdateAfter());



router.delete('/customers/:id/tickets/:tid/comments/:cid', idsSent, (req,res,next) => {
    const user_id = req.params.id;
    const ticket_id = req.params.tid;
    const comment_id = req.params.cid;
    customers.deleteCustomerTicketCommentBy(user_id, ticket_id, comment_id)
        .then(results => {
            if(results.rowCount == 0){
                res.status(404).json({})
            }else{
                res.status(200).json({success:true});
                req.body = results.rows;
                next()
            }
        })
        .catch(error => {
            res.status(500).json({error});
            logError(error)
        })
},logMiddlewareFactory('DeleteCommentOnTicketCustomer'));

module.exports = router;

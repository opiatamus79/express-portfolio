var express   = require('express');
var router    = express.Router();
var Comm      = require('../helpers/communicationFunctions');
const {logMiddlewareFactory,logError} = require('../helpers/logFunctions');
const {AWSFileUploadWithParams, setOp} = require('../helpers/fileUploaderFunctions');

/* GET Retrieve communication logs. */
router.get('/communication_logs', (req, res, next) => {
  if (req.query.page || req.query.limit){
    Comm.getFilteredCommunicationLogs(req.query)
      .then(results => {
        results.length != 0 &&
        res.status(200).json(results) ||
        res.status(404).json({})
      })
      .catch(error => {
        error.isJoi &&
        res.status(400).json({ message: "Please check the data sent", error: error })
        res.status(500).json({ error: error });
        logError(error);
      })
  }else{
    console.log('just getting logs')
    Comm.getCommunicationLogs()
      .then(results => {
        res.status(200).json(results)
      })
      .catch(error => {
        if(error.isJoi){
          res.status(400).json(error.details[0].message)
        }else if(error.statusCode){
          res.status(error.statusCode).json({error : error.errorMessage})
        }else{
          res.status(500).json({error : error});
          logError(error)
        }
      })
  }
});

/* GET Retrieve communication logs in a date range. */
router.get('/communication_logs/:from/:to', (req, res, next) => {
  Comm.getCommunicationLogsInDateRange(req.params,req.query)
    .then(results => {
      res.status(200).json(results)
    })
    .catch(error => {
      if(error.isJoi){
        res.status(400).json(error.details[0].message)
      }else if(error.statusCode){
        res.status(error.statusCode).json({error : error.errorMessage}) 
      }else{
        res.status(500).json({error : error});
        logError(error)
      }
    })
});

/* GET Retrieve communication logs by log id */
router.get('/communication_logs/:log_id', (req, res, next) => {
  Comm.getCommunicationLogsById(req.params)
    .then(results => {
      res.status(200).json(results);
    })
    .catch(error => {
      if(error.isJoi){
        res.status(400).json(error.details[0].message)
      }else if(error.statusCode){
        res.status(error.statusCode).json({error : error.errorMessage}) 
      }else{
        res.status(500).json({error : error});
        logError(error);
      }
    }) 
})

router.post('/send_email/', setOp('emails'), AWSFileUploadWithParams,(req,res,next) => {
  const attInfo = [];
  req.files.forEach(file => { attInfo.push({url: file.location, filename: file.originalname})})
  req.body.email_data = JSON.parse(req.body.data);
  req.body.email_data.attachments_data = attInfo;
  
  Comm.sendEmail(req.body.email_data)
    .then(results => {
      res.status(200).json(results);
      next();
    })
    .catch(error => {
      console.log("ERROR IN SENDING EMAIL:" ,error);
      if(error.isJoi){
        res.status(400).json({error : error.details[0].message, isJoi : true})
      }else if(error.statusCode){
        res.status(error.statusCode).json({error : error.errorMessage}) 
      }else{
        res.status(500).json({error : error});
        logError(error);
      }
    });
}, logMiddlewareFactory('CreateSendMail'));

module.exports = router;





























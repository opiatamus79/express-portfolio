var express = require('express');
var router = express.Router();
const {logMiddlewareFactory,logError, logUpdateBefore, logUpdateAfter} = require('../helpers/logFunctions');
var accts = require('../helpers/accountFunctions');


/* GET all bills */
router.get('/', function(req, res, next) {
  accts.getAccounts()
    .then(results => {
      console.log("Results: ", results)
      res.status(200).json(results);
    })
    .catch(error => {
      if(error.statusCode){
        res.status(error.statusCode).json({error : error.errorMessage}) 
      }
      else{
        console.log("error: ", error);
        res.status(500).json({error : error})
        logError(error)
      }
    })
});

/*GET a single account by Id */
router.get('/:aid', function(req, res, next) { 
  accts.getAcctById(req.params)
  .then(results => {
    if(results.length > 0){
      res.status(200).json(results);
    }
    else{
      console.log('Could not find account.');
      res.status(404).json([]);//account was not found
    } 
  })
  .catch(error => {
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
});




/*POST an account */
router.post('/', function(req, res, next) {
  accts.createAccount(req.body)
  .then(results => {
    console.log("Results: ", results)
    if(!results){      
      console.log('May not have provided valid account status id or user id.')
      res.status(404).json([]);
    }
    else
      res.status(200).json(results);
      next();
  })
  .catch(error => {
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
}, logMiddlewareFactory('CreateAccount'));



/*PUT to update an account with given id */
router.put('/:aid',  logUpdateBefore('account', 'updateAccount'),function(req, res, next) {
  accts.updateAccount(req.body, req.params)
  .then(results => {
    console.log("Results: ", results);
    if(!results){
      console.log('Could not find account or did not provide valid account_status id or user id.');
      res.status(404).json([]);//Account was not found
    }
    else{
      req.body = results;
      res.status(200).json(results);
      next()
    }
  })
  .catch(error => {
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
},logUpdateAfter());





/*DELETE account with given id*/
router.delete('/:aid', function(req, res, next) { 
  accts.deleteAccount(req.params)
  .then(results => {
    console.log("Results: ", results)
    if(results.length > 0){
      res.status(200).json(results);
      req.body = results;
      next();
    }
    else{
      console.log('Could not find account.');
      res.status(404).json([]);//could not find account
    } 
  })
  .catch(error => {
    if(error.isJoi){
      res.status(400).json(error.details[0].message)
    }
    else if(error.statusCode){
      res.status(error.statusCode).json({error : error.errorMessage}) 
    }
    else{
      console.log("error: ", error);
      res.status(500).json({error : error})
    }
  })
},logMiddlewareFactory('DeleteAccount'));





module.exports = router;

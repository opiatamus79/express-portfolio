var express = require('express');
var router = express.Router();
const {logMiddlewareFactory,logError, logUpdateBefore, logUpdateAfter} = require('../helpers/logFunctions');
const {isGuestTicket} = require('../helpers/validationFunctions');
var tickets = require('../helpers/ticketFunctions');
const {AWSFileUploadWithParams,setOp} = require('../helpers/fileUploaderFunctions');
const [TICKET_CREATED_TEMPLATE, TICKET_UPDATED_TEMPLATE, TICKET_COMMENT_TEMPLATE] = ["supportTicket", "statusChange","ticketReceievedRes"];

/* GET all tickets */
router.get('/', function(req, res, next) {
  if (
    req.query.page
    || req.query.limit
    || req.query.search
    || req.query.ticket_status
    || req.query.ticket_type
  ) {
    tickets.getFilteredTickets(req.query)
      .then(results => {
          res.status(200).json(results) 
      }).catch(error => {
        console.log("error: ", error);
        error.isJoi &&
          res.status(400).json({ message: "Please check the data sent", error: error }) ||
          res.status(500).json({ error: error })
        logError(error);
      })
  
  } else {
    tickets.getTickets()
      .then(results => {
        console.log("Results: ", results)
        res.status(200).json(results);
      })
      .catch(error => {
        if (error.statusCode) {
          res.status(error.statusCode).json({ error: error.errorMessage })
        }
        else {
          console.log("error: ", error);
          res.status(500).json({ error: error })
          logError(error)
        }
      })
  }  
});

/*GET a single ticket by Id */
router.get('/:tid', function(req, res, next) {
  tickets.getTicketById(req.params)
  .then(results => {
    if(results.length > 0){
      res.status(200).json(results[0]);
    }
    else{
      console.log('Could not find ticket.');
      res.status(404).json([]);//ticket/ was not found
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

/*GET a tickets comments by given ticket id */
router.get('/:tid/comments', function(req, res, next) {
  tickets.getTicketComments(req.params)
  .then(results => {
    results.exists &&
      res.status(200).json(results.data) ||
      res.status(404).json({ error: 'Comments not found' })
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


/*POST a ticket */
router.post('/', function(req, res, next) {
  tickets.createTicket(req.body)
    .then(results => {
      if(!results)
        return results;
      tickets.getUserAndSendEmailTicket(results[0].id, results[0].details.email, TICKET_CREATED_TEMPLATE)
      return results;
    })
    .then(results => {
    console.log("Results: ", results)
    if(!results){      
      console.log('May not have provided valid account id, ticket status id, or ticket type id.')
      res.status(404).json([]);
    }
    else{
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
},logMiddlewareFactory('CreateTicket'));

router.post('/guest', isGuestTicket ,function(req,res,next) {
  tickets.guestUserSendEmailTicket(req.body)
      .then(results => {
          res.status(200).json(results);
      })
      .catch(error => {
        if (error.isJoi) {
          res.status(400).json(error.details[0].message)
        }
        else if (error.statusCode) {
          res.status(error.statusCode).json({error: error.errorMessage})
        }
        else {
          console.log("error: ", error);
          res.status(500).json({error: error})
          logError(error)
        }

      })
})

/*POST a comment on a ticket with given id */
router.post('/:tid/comments', function(req, res, next) {
  tickets.postComment(req.body, req.params)
    .then(results => {
      if(!results)
        return results;
      tickets.getUserAndSendEmailTicket(results[0].ticket_id, results[0].ticket_user_id, TICKET_COMMENT_TEMPLATE)
      return results
    })
    .then(results => {
      if(!results){
        console.log('Could not find Ticket.');
        res.status(404).json([]);//Ticket was not found 
      }
      else{
        res.status(200).json(results[0]);
      }
    })
    .catch(error => {
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
}, logMiddlewareFactory('CreateCommentOnTicket'));

/*PUT to update a ticket with given id */
router.put('/:tid', setOp('tickets'),AWSFileUploadWithParams, logUpdateBefore('ticket','UpdateTicket'), function(req, res, next) {
  req.body.details = JSON.parse(req.body.details);
  if(req.body.details.images){
    req.body.details.images = req.body.details.images.concat(req.files.map(file => file.location));
  }
  delete req.body.files;
  tickets.updateTicket(req.body, req.params)
    .then(results => {
      console.log("Results: ", results)
      if(!results){
        console.log('Could not find Ticket or did not provide valid user id, account id, ticket status id, or ticket type id.');
        res.status(404).json([]);//Ticket was not found 
      }
      else{
        req.body = results[0];
        res.status(200).json(results);
        next()
      }
    })
    .catch(error => {
      console.log("error: ", error);
      if(error.isJoi){
        res.status(400).json({ error: error.details[0].message })
      }
      else if(error.statusCode){
        res.status(error.statusCode).json({error : error.errorMessage}) 
      }
      else{
        console.log("error: ", error);
        res.status(500).json({error : error})
      }
    })
},logUpdateAfter());

/*PUT to update a tickets status with given id */
router.put('/:tid/status',logUpdateBefore('ticket', 'UpdatedTicketStatus') ,function(req, res, next) { //may not need req.body
  tickets.updateStatus(req.body, req.params)
    .then(results => {
      if(results.length == 0)
        return results;
      tickets.getUserAndSendEmailTicket(results[0].id, results[0].user_id, TICKET_UPDATED_TEMPLATE)
      return results;
    })
  .then(results => {
    if(results.length > 0){
      res.status(200).json(results);
      req.body = results;
      next()
    }
    else{
      console.log('May not have provided valid ticket status id or could not find ticket.');
      res.status(404).json([]);//ticket or status type was not found
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
},logUpdateAfter());

/*PUT to update a tickets type with given id */
router.put('/:tid/type', logUpdateBefore('ticket', 'UpdateTicketType'), function(req, res, next) {
  tickets.updateType(req.body, req.params)
  .then(results => {
    if(results.length > 0){
      res.status(200).json(results);
      req.body = results;
      next()
    }
    else{
      console.log('May not have provided valid ticket type id or could not find ticket.');
      res.status(404).json([]);//ticket was not found
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
});

/*DELETE a ticket with given id*/
router.delete('/:tid', function(req, res, next) { 
  tickets.deleteTicket(req.params)
  .then(results => {
    console.log("Results: ", results)
    if(results.length > 0){
      res.status(200).json(results);
      req.body = results;
      next()
    }
    else{
      console.log('Could not find ticket.');
      res.status(404).json([]);//ticket was not found
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
}, logMiddlewareFactory('DeleteTicket'));

/*DELETE a comment on a ticket with given id */
router.delete('/:tid/comments/:cid', function(req, res, next) {
  tickets.deleteComment(req.params)
  .then(results => {
    if(results.length > 0){
      res.status(200).json(results);
      req.body = results;
      next()
    }
    else{
      console.log('May have provided invalid ticket id or ticket comment.');
      res.status(404).json([]);//ticket/comment was not found
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
}, logMiddlewareFactory('DeleteCommentOnTicet'));




module.exports = router;

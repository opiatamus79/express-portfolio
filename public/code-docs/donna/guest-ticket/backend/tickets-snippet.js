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

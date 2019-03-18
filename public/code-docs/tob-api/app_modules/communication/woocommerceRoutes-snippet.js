router.post('/order', function(req, res, next) {
  //Note: this route will be calling function to send out email after receiving order, with order details for each vendor.
  //console.log(req.body.line_items);

  wc.retrieveVendors().then(vendorList=>{
    wc.retrieveMailList(req.body.line_items)
    .then(result=>{ //left off here adding vendorList into function to be passed in to sendEmail..need to only
      //include logic from receiptlogic.js and use dictionary to parse out receipts.
      comm.sendEmail(req.body, result, vendorList, function(err,result) {
        err ? res._destroy.status(500).send({ error:err }) : res.status(200).json(result)
      });
    });
  })
});


router.get('/retrieveVendors', function(req, res, next) {

  wc.retrieveVendors()
  .then((response) => {
    res.status(200).json(response);
  }).catch((error) => {
    res.status(500).json({error: error});
    })

});
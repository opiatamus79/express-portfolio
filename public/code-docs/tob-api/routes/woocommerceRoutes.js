const express = require('express');
const router = express.Router();
const wc = require('../app_modules/woocommerce/woocommerce');
const comm = require('../app_modules/communication/communication');

/* GET users listing. */
router.get('/', (req, res, next) => {
  //res.send('respond with a resource');
  wc.getProducts()
  .then((response) => {
    res.status(200).json(response);
  }).catch((error) => {
    res.status(500).json({error: error});
    })
});

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



router.get('/testHeroku', function(req, res, next) {
  //Note: this route will be calling function to send out email after receiving order, with order details for each vendor.
  wc.test_heroku_dbCon()
  .then((response) => {
    res.status(200).json(response);
  }).catch((error) => {
    res.status(500).json({error: error});
    })

 // console.log(req.body);
  //res.status(200).json(req.body.email);
});






module.exports = router;

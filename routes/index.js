var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



/* GET about page. */
router.get('/about', function(req, res, next) {
  res.render('about', { title: 'Express' });
});


/* GET about page. */
router.get('/project-swarm', function(req, res, next) {
  res.render('project-swarm', { title: 'Express' });
});



module.exports = router;

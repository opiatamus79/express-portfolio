var express = require('express');
var router = express.Router();



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' });
});



/* GET about page. */
router.get('/about', function(req, res, next) {
  res.render('about', { title: 'About' });
});


/* GET about page. */
router.get('/project-swarm', function(req, res, next) {
  res.render('project-swarm', { title: 'Project-Detail' });
});


/* GET about page. */
router.get('/project-donna', function(req, res, next) {
  res.render('project-donna', { title: 'Project-Detail' });
});


/* GET about page. */
router.get('/project-tob', function(req, res, next) {
  res.render('project-tob', { title: 'Project-Detail' });
});

router.get('/project-swarm', function(req, res, next) {
  res.render('project-swarm', { title: 'Project-Detail' });
});

router.get('/transcript', function(req, res, next) {
  res.render('transcript', { title: 'Transcript' });
});

router.get('/resume', function(req, res, next) {
  res.render('resume', { title: 'Resume' });
});

module.exports = router;

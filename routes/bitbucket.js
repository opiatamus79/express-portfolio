///bitbucket/authenticated
var express = require('express');
var router = express.Router();
const { createBitbucketAPI } = require('bitbucket-api-v2');

const { getAccessToken } = require('bitbucket-auth');

const config = {
  appName: 'portfolio',
  consumerKey: process.env.BB_Key,
  consumerSecret: process.env.BB_Secret,
  // ... more optional configuration (see getAccessToken function )
}

//const bitbucketApi = createBitbucketAPI() //or: createBitbucketAPI({useXhr: true})
//bitbucketApi.authenticateOAuth2(someAccessToken)
async function getToken() {
const accessToken = await getAccessToken(config)
}
getToken();




/* GET test page. */
router.get('/authenticated', function(req, res, next) {
	console.log( process.env.BB_Secret);
  //bitbucketApi.authenticateOAuth2()
  res.render('commit-history', { title: 'Commit History' });
});





module.exports = router;

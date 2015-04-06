var express = require('express');
var router = express.Router();
var ig = require('instagram-node').instagram();
var YAML = require('yamljs');

var config = YAML.load('config.yaml');

ig.use({
  client_id: config['instagram']['client_id'],
  client_secret: config['instagram']['client_secret']
});

router.get('/', function(req, res, next) {
  var lat = 1.29088;
  var lng = 103.84444;

  ig.media_search(lat, lng, {count: 20}, function(err, media, remaining, limit) {
    res.render('index', {'media_list': media});
  });
});

module.exports = router;

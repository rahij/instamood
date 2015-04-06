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
  var lat = parseFloat(req.query['lat']) || 1.301778;
  var lng = parseFloat(req.query['lng']) || 103.772208;

  var min_timestamp = 1427626800;
  var max_timestamp = 1427659200;

  ig.media_search(
    lat,
    lng,
    {
      min_timestamp: min_timestamp,
      max_timestamp: max_timestamp,
      count: 50
    }, function(err, media_list, remaining, limit) {

    var freq = {}
    hashtags = media_list.map(function(media){
      media['tags'].map(function(tag){
        if(tag in freq) {
          freq[tag] += 1
        }
        else {
          freq[tag] = 0
        }
      })
    });

    sorted_tags = Object.keys(freq).sort(function(a,b){return freq[b]-freq[a]});
    res.render('index', {
      lat: lat,
      lng: lng,
      media_list: media_list,
      mood: 'Sad',
      top_tags: sorted_tags.slice(0, 9).join(', ')
    });
  });
});

module.exports = router;

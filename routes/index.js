var express = require('express');
var router = express.Router();
var ig = require('instagram-node').instagram();
var YAML = require('yamljs');

var config = YAML.load('config.yaml');
var location_list = YAML.load('locations.yaml');

ig.use({
  client_id: config['instagram']['client_id'],
  client_secret: config['instagram']['client_secret']
});

router.get('/', function(req, res, next) {
  res.render('index', {
    location_list: location_list
  });
});

router.get('/stream/:loc', function(req, res, next) {
  var location_name = 'NUS';
  var lat = 1.301778
  var lng = 103.772208;

  for(var i = 0; i < location_list.length; ++i) {
    if(location_list[i].name == req.params['loc']) {
      lat = location_list[i].lat;
      lng = location_list[i].lng;
      location_name = req.params['loc'];
      break;
    }
  }

  var min_timestamp = 1427626800;
  var max_timestamp = 1427659200;

  ig.media_search(
    lat,
    lng,
    {
      // min_timestamp: min_timestamp,
      // max_timestamp: max_timestamp,
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
    res.render('stream', {
      lat: lat,
      lng: lng,
      location_name: location_name,
      media_list: media_list,
      mood: 'Sad', // TODO: jin zhe
      top_tags: sorted_tags.slice(0, 9).join(', ')
    });
  });
});

module.exports = router;

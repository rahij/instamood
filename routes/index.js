var express = require('express');
var router = express.Router();
var ig = require('instagram-node').instagram();
var YAML = require('yamljs');
var request = require('request');

var config = YAML.load('config.yaml');
var location_list = YAML.load('locations.yaml');
var emotions_by_location = {};

function get_location_from_lat_lng(lat, lng) {
  for(var i = 0; i < location_list.length; ++i) {
    if(location_list[i].lat == lat && location_list[i].lng == lng) {
      return location_list[i].name;
    }
  }
  return null;
}

function media_compare(a,b) {
  if (a['created_time'] < b['created_time'])
     return 1;
  if (a['created_time'] > b['created_time'])
    return -1;
  return 0;
}

ig.use({
  client_id: config['instagram']['client_id'],
  client_secret: config['instagram']['client_secret']
});

router.get('/', function(req, res, next) {
  request(config['api']['url'] + 'loc_emotions', function (error, response, body) {
    var emotions = JSON.parse(body)['results'];
    // var emotions_by_location = {}
    for(var i = 0; i < emotions.length; ++i) {
      emotions_by_location[get_location_from_lat_lng(emotions[i]['lat'], emotions[i]['lng'])] = emotions[i]['emotion'];
    }
    res.render('index', {
      location_list: location_list,
      emotions_by_location: emotions_by_location
    });
  })
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
      min_timestamp: ((new Date().getTime() - (4 * 60 * 60 * 1000))/1000.0),
      // max_timestamp: max_timestamp,
      count: 50
    }, function(err, media_list, remaining, limit) {
      var freq = {};
      var emotion = '';
      media_list.sort(media_compare);

      media_list.map(function(media){
        media['tags'].map(function(tag){
          if(tag in freq) {
            freq[tag] += 1
          }
          else {
            freq[tag] = 0
          }
        })
        // Classification
        post_data = {data: {
          lat: lat,
          lng: lng,
          likes_count: media['likes']['count'],
          comments_data: media['comments']['data'],
          tags: media['tags'],
          filter_used: media['filter'],
          caption: media['caption']
        }};
        result = '';
        result_val = 0;
        request.post({
          url: config['api']['url'] + 'classify_media',
          json: true,
          body: post_data},
          function(err, response, body) {
            for(var emotion in body) {
              if(body[emotion] > result_val) {
                result = emotion;
                result_val = body[emotion]
              }
            }
          }
        );
      });

      sorted_tags = Object.keys(freq).sort(function(a,b){return freq[b]-freq[a]});

      // temp hack
      interval = setInterval(function(){
        if(result != '') {
          clearInterval(interval);
          res.render('stream', {
            lat: lat,
            lng: lng,
            location_name: location_name,
            media_list: media_list,
            emotion: result,
            top_tags: sorted_tags.slice(0, 9).join(', ')
          });
        }
      }, 500);
    });
  });

module.exports = router;

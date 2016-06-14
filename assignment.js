var http = require('http'),
  monk = require('monk'),
  jade = require('pug')

var db = require('monk')('localhost/animals')
var dogs = db.get('dogs')
var allDogs = []


function handleRequest(req, res) {
  var urlArray = req.url.split('/')

  var compiledTemplate;
  if (req.url === '/favicon.ico') {
    res.end();
    return;
  }
  if (urlArray[3] === 'edit') {
    var dog;
    dogs.find({'_id': urlArray[2]}, function(err, data){
      dog = data
      compiledTemplate = setJade('./views/dog.edit.jade')
      var rendered = compiledTemplate({dog: dog})

      res.end(rendered)
    })
  }
   else if (urlArray[3] === 'delete') {
      dogs.remove({'_id': urlArray[2]})
      res.writeHead(302, {
        'Location': '/dogs'
      })
      res.end();
} else if (urlArray.length > 2 && urlArray[2].length === 24) {
    if (req.method === 'POST') {
      req.on('data', function (data) {
        var inputs = data.toString().split('&')
        var newDog = inputs.reduce(function(object, string){
          var keyValue = string.split('=')
          object[keyValue[0]] = keyValue[1]
          return object
        }, {})
        dogs.update({'_id': urlArray[2]}, {$set: newDog});
      })
    }
    var dog;
    dogs.find({'_id': urlArray[2]}, function(err, data){
      dog = data
      compiledTemplate = setJade('./views/dog.jade')
      var rendered = compiledTemplate({dog: dog})

      res.end(rendered)
    })
  } else if (req.url === '/dogs') {
    if (req.method === 'POST') {
      req.on('data', function (data) {
        var inputs = data.toString().split('&')
        var newDog = inputs.reduce(function(object, string){
          var keyValue = string.split('=')
          object[keyValue[0]] = keyValue[1]
          return object
        }, {})
        dogs.insert(newDog)
      })
    }
    dogs.find({}, function(err, data){
      allDogs = data

      compiledTemplate = setJade('./views/dogs.jade')

      var rendered = compiledTemplate({dogs: allDogs})

      res.end(rendered)
    });
  } else if (urlArray[2] === 'new') {
    compiledTemplate = setJade('./views/dogs.new.jade')
    var rendered = compiledTemplate({})
    res.end(rendered)
  } else {
    res.end('404')
  }
}

function setJade (file) {
  return jade.compileFile(file, {pretty: true})
}

http.createServer(handleRequest).listen(1337)

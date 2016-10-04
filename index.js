var express = require('express')
var app = express()

var example_scores = {
  "Tommy": [[190,202],[178,190],[182,194],[177,189]],
  "Angelica": [[191,205],[164,178],[185,197],[190,204]],
  "Little Foot": [[192,204],[176,188],[195,207],[190,202]],
  "Bo Peep": [[187,199],[186,198],[184,196],[193,205]],
  "Buzz Lightyear": [[184,196],[201,213],[191,203],[194,206]],
};

//Score range: [low, high] -> low <= score < high
var teams = {
  "Yellow"     : { score_range: [000, 161], color: "#fffdb6", },
  "Light Blue" : { score_range: [161, 179], color: "#F6FFFF", },
  "Orange"     : { score_range: [179, 192], color: "#ffc675", },
  "Green"      : { score_range: [192, 204], color: "#b5ff97", },
  "Purple"     : { score_range: [204, 213], color: "#c99fff", },
  "Pink"       : { score_range: [213, 221], color: "#ffb5e5", },
  "Red"        : { score_range: [221, 226], color: "#ffb2b2", },
  "Dark Blue"  : { score_range: [226, 231], color: "#618aff", },
  "Grey"       : { score_range: [231, 235], color: "#d5d5d5", },
  "Silver"     : { score_range: [235, 999], color: "#eaeaea", },
};

var splitScore = function(scores) {
  return {
      "name": scores[0],
      "oat": {low_score: scores[1][0], high_score: scores[1][1]},
      "rcn": {low_score: scores[2][0], high_score: scores[2][1]},
      "geo": {low_score: scores[3][0], high_score: scores[3][1]},
      "sp":  {low_score: scores[4][0], high_score: scores[4][1]},
  };
};

var scoreToTeam = function(score){
  for (t in teams) {
      var range = teams[t]["score_range"];
      var low_score = score.low_score;
      if (low_score >= range[0] && low_score < range[1]) {
          return t;
      }
  }
};
  
var calculateStudentScores = function(all_scores) {
    var student_scores = [];
    for (var i=0; i < all_scores.length; i++) {
        var student = splitScore(all_scores[i]);

        var areas = ["oat", "rcn", "geo", "sp"];
        for (var j=0; j < areas.length; j++) {
            var area = areas[j];
            student[area].teamName = scoreToTeam(student[area]);
            student[area].color = teams[student[area].teamName].color;
            student[area].link = "/playlist/"+area+"#"+student[area].teamName;
        }

        student_scores.push(student);
    }
    return student_scores;
}

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.set('views', './views');
app.set('view engine', 'jade');

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))
app.use('/playlists', express.static(__dirname + '/playlists'))

app.get('/', function(request, response) {
    return response.render('base');
})

app.get('/playlist/', function(request, response) {
    return response.render('base')
})

app.post('/download', function(request, response) {
    var scores = JSON.parse(request.body.all_scores_json);
    console.log(scores);
    var student_scores = calculateStudentScores(scores);
    console.log(student_scores);
    return response.render('mapping', {student_scores: student_scores}, function(err, html) {
        if (err) {
            return console.log(err);
        }

        response.set('Content-Type', 'text/html');
        response.set('Content-Disposition','attachment; filename=score-mapping.html');
        response.send(html);
    });
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})

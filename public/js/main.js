var all_scores = [
    ["Tommy", [190,202],[178,190],[182,194],[177,189]],
    ["Angelica", [191,205],[164,178],[185,197],[190,204]],
    ["Little Foot", [192,204],[176,188],[195,207],[190,202]],
    ["Bo Peep", [187,199],[186,198],[184,196],[193,205]],
    ["Buzz Lightyear", [184,196],[201,213],[191,203],[194,206]],
];

var show_edit = false;

//Score range: [low, high] -> low <= score < high
var teams = {
    "Yellow"     : { score_range: [000, 161], color: "fffdb6", hash: "yellow"},
    "Light Blue" : { score_range: [161, 179], color: "F6FFFF", hash: "lightblue"},
    "Orange"     : { score_range: [179, 192], color: "ffc675", hash: "orange"},
    "Green"      : { score_range: [192, 204], color: "b5ff97", hash: "green"},
    "Purple"     : { score_range: [204, 213], color: "c99fff", hash: "purple"},
    "Pink"       : { score_range: [213, 221], color: "ffb5e5", hash: "pink"},
    "Red"        : { score_range: [221, 226], color: "ffb2b2", hash: "red"},
    "Dark Blue"  : { score_range: [226, 231], color: "618aff", hash: "darkblue"},
    "Grey"       : { score_range: [231, 235], color: "d5d5d5", hash: "grey"},
    "Silver"     : { score_range: [235, 999], color: "eaeaea", hash: "silver"},
}
var splitScore = function(scores) {
    return {
        "name": scores[0],
        "oat": scores[1],
        "no": scores[2],
        "md": scores[3],
        "geo": scores[4],
    };
}

var scoreToTeam = function(score){
    for (t in teams) {
        var range = teams[t]["score_range"]
            var low_score = score[0];
        if (low_score >= range[0] && low_score < range[1]) {
            return t;
        }
    }
}

var scoreToCell = function(scores, part) {
    var score = scores[part];
    var teamName = scoreToTeam(score);
    var team = teams[teamName];
    var link = "http://www.map2khan.com/playlists/"+part+".html#" + team.hash;

    var cell = "<td style='background-color: #" + team.color + "'>";
    cell += "<a class='team' href='" + link +"' target='_blank'>" + teamName + "</a>";
    cell += "<span class='scores'>" + score[0] + "-" + score[1] + "</span></td>";
    return cell;
};

var refreshScores = function() {
    $("#scores .student").empty();

    for (var i = 0; i<all_scores.length; i++) {
        var student = splitScore(all_scores[i]);

        var row = "<tr class='student' data-index='"+i+"'><th>"+student.name+"</th>";
        row += scoreToCell(student, "oat");
        row += scoreToCell(student, "no");
        row += scoreToCell(student, "md");
        row += scoreToCell(student, "geo");
        row += "<td class='remove'><i class='glyphicon glyphicon-remove' title='Remove Student'></i></td>";
        row += "</tr>";
        $(".add-student").before(row);
    }
    $(".student .remove").toggleClass("hidden", !show_edit).click(function(){
        var index = $(this).parent().attr("data-index");
        all_scores.splice(index, 1);
        saveScores();
        refreshScores();
    });
    $("#scores .add-student").toggleClass("hidden", !show_edit);
};

function saveScores() {
    localStorage.setItem("all_scores", JSON.stringify(all_scores));
}

function startEditing(){
    $(".title").text("Your class playlists:");
    $("#create").addClass("hidden");
    $("#export").removeClass("hidden");
    $("#bulk").removeClass("hidden");
    show_edit = true;
    refreshScores();
}

function parseAndAdd(text) {
    //basic CSV parsing
    var lines = text.split("\n");
    var error = function(text, lineno) {
        $("#bulk-error").removeClass("hidden").text(text + ' on line ' + (lineno+1) + ', starting: "'+lines[lineno].substr(0,5)+'..."');
    }

    var scores = [];
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        //skip empty lines and comments
        if (line.length == 0 || line[0] == "#") {
            continue;
        }
        var vals = line.split(",");
        if (vals.length != 5) {
            error("Not enough values", i); return false;
        }
        if (vals[0] == "") { 
            error("Empty name", i); return false;
        }
        if (vals[1] == "" || !vals[1].match(/\d{3}-\d{3}/)) { 
            error("Invalid operations score", i); return false;
        }
        if (vals[2] == "" || !vals[2].match(/\d{3}-\d{3}/)) { 
            error("Invalid number score", i); return false;
        }
        if (vals[3] == "" || !vals[3].match(/\d{3}-\d{3}/)) { 
            error("Invalid measurement score", i); return false;
        }
        if (vals[4] == "" || !vals[4].match(/\d{3}-\d{3}/)) { 
            error("Invalid geometry score", i); return false;
        }
        scores.push([vals[0], vals[1].split("-"), vals[2].split("-"), vals[3].split("-"), vals[4].split("-")]);
    }
    for (var i = 0; i < scores.length; i++) {
        all_scores.push(scores[i]);
    }
    $("#bulk-error").addClass("hidden");
    return true;
};

$(function(){
    if (localStorage.getItem("all_scores")) {
        all_scores = JSON.parse(localStorage.getItem("all_scores"));
        startEditing();
    }
    refreshScores();
    $("#create").click(function(){
        all_scores = [];
        startEditing();
    });
    $("#bulk").click(function(){
        $("#bulk").addClass("hidden");
        $(".bulk-form").removeClass("hidden");
    });
    $("#bulk-save").click(function(){
        //returns true on success
        if (parseAndAdd($("#bulk-input").val())) {
            $("#bulk").removeClass("hidden");
            $(".bulk-form").addClass("hidden");

            saveScores();
            refreshScores();
        }
    });
    $("#add-student-form").submit(function(e){
        e.preventDefault();
        var student = [];
        student.push($("#add-student-form .name").val());
        student.push($("#add-student-form .oat").val().split("-"));
        student.push($("#add-student-form .no").val().split("-"));
        student.push($("#add-student-form .md").val().split("-"));
        student.push($("#add-student-form .geo").val().split("-"));
        all_scores.push(student);
        saveScores();
        refreshScores();
        return false;
    });
    $("#add-student-form input").change(function(){
        var t = $(this);
        if (t.val() == '') {
            t.next(".error").removeClass("hidden").text("Cannot be empty");
        } else if (!t.hasClass("name") && !t.val().match(/\d{3}-\d{3}/)) {
            t.next(".error").removeClass("hidden").text("Score should look like 'abc-xyz'");
        } else {
            t.next(".error").addClass("hidden");
        }
    });
    $("#export-form").submit(function(){
        $("#scores-input").val(JSON.stringify(all_scores))
        return true;
    });
});

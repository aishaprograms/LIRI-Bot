var twitterKeys = require('./keys.js');
var Twitter = require('twitter');
var spotify = require('spotify');
var request = require('request');
var fs = require('fs');

var parameters = process.argv;
var command = parameters[2];
var commandParametersArray = parameters.slice(3);
var commandParameters;

editCommandParameters();
processParameters();
appendCommands();

function editCommandParameters() {
    for (var i = 0; i < commandParametersArray.length; i++) {
        commandParametersArray[i] = commandParametersArray[i].replace(/[^a-zA-Z0-9 ]/g, '');
    }
    commandParameters = commandParametersArray.join('+');
}

function processParameters() {
    if (command === 'my-tweets') {
        myTweets();
    } else if (command === 'spotify-this-song') {
        spotifyThisSong();
    } else if (command === 'movie-this') {
        movieThis();
    } else if (command === 'do-what-it-says') {
        doWhatItSays();
    } else {
        console.log('Please enter a valid input');
    }
}

// * This will show your last 20 tweets and when they were created at in your 
// terminal/bash window.
function myTweets() {
    var client = new Twitter(twitterKeys.twitterKeys);
    var params = { screen_name: 'aishaprograms' };
    client.get('statuses/user_timeline', params, function(error, tweets,
        response) {
        if (!error) {
            //tweets is an array of objects, each of which contain data
            var maxTweets = 20;
            for (var i = 0; i < tweets.length; i++) {
                console.log('Tweet number ' + maxTweets);
                console.log('aishaprograms tweeted: ' + tweets[i].text);
                console.log('at ' + tweets[i].created_at);
                maxTweets--;
                if (maxTweets === 0) {
                    break;
                }
            }
        }
    });
}
// * This will show the following information about the song in your 
// terminal/bash window
//     * Artist(s)
//     * The song's name
//     * A preview link of the song from Spotify
//     * The album that the song is from

// * if no song is provided then your program will default to
//     * "The Sign" by Ace of Base
function spotifyThisSong() {
    //if parameters, as in the track name, were not given after the command
    //set the command parameters to "The Sign" by Ace of Base
    if (parameters.splice(2).length === 1 || commandParameters === undefined) {
        commandParameters = 'The Sign Ace of Base';
    }
    spotify.search({ type: 'track', query: commandParameters },
        function(err, data) {
            if (err) {
                console.log('Error occurred: ' + err);
                return;
            }
            // Info about most popular song
            //Name of song
            var name = data.tracks.items[0].name;
            console.log('Track name: ' + name);
            //Artists is an array
            console.log('Artist(s): ');
            var artists = data.tracks.items[0].artists;
            for (var i = 0; i < artists.length; i++) {
                console.log((i + 1) + ': ' + artists[i].name);
            }
            var link = data.tracks.items[0].external_urls.spotify;
            console.log('Spotify link: ' + link);
            var album = data.tracks.items[0].album.name;
            console.log('This track is found on the album: ' + album);
        });
}

// * This will output the following information to your terminal/bash window:

//     * Title of the movie.
//     * Year the movie came out.
//     * OMDB Rating of the movie.
//     * Country where the movie was produced.
//     * Language of the movie.
//     * Plot of the movie.
//     * Actors in the movie.
//     * Rotten Tomatoes Rating.
//     * Rotten Tomatoes URL.

// * If the user doesn't type a movie in, the program will output data for the 
// movie 'Mr. Nobody.'
function movieThis() {
    if (parameters.splice(2).length === 1 || commandParameters === undefined) {
        commandParameters = 'Mr+Nobody';
    }
    var queryUrl = 'http://www.omdbapi.com/?t=' + commandParameters +
        '&y=&plot=short&r=json&tomatoes=true';
    request(queryUrl, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log('Title: ' + JSON.parse(body).Title);
            console.log('Year: ' + JSON.parse(body).Year);
            console.log('OMDB rating: ' + JSON.parse(body).imdbRating);
            console.log('Country: ' + JSON.parse(body).Country);
            console.log('Language: ' + JSON.parse(body).Language);
            console.log('Plot: ' + JSON.parse(body).Plot);
            console.log('Actors: ' + JSON.parse(body).Actors);
            console.log('Rotten Tomatoes rating: ' + JSON.parse(body).tomatoRating);
            console.log('Rotten Tomatoes url: ' + JSON.parse(body).tomatoURL);

        } else {
            console.warn(error);
        }
    });
}

// Using the fs Node package, LIRI will take the text inside of random.txt and 
// then use it to call one of LIRI's commands.
// It should run spotify-this-song for "I Want it That Way," as follows the 
// text in random.txt.
// Feel free to change the text in that document to test out the feature for 
// other commands.
function doWhatItSays() {
    fs.readFile('random.txt', 'utf8', function(err, data) {
        if (err) {
            console.log(err);
        }
        var searches = data.split(',');
        command = searches[0];
        commandParameters = searches[1];
        processParameters();
    });
}

//In addition to logging the data to your terminal/bash window, output the data 
// to a .txt file called log.txt.
// Make sure you append each command you run to the log.txt file.
function appendCommands() {
    var logText = command + ' ' + commandParameters + ',';
    fs.appendFile('log.txt', logText, function(error) {
        if (error) {
            return console.log(error);
        }
    });
}

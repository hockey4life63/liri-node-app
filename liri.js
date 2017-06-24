let keys = require("./keys")
let Spotify = require('node-spotify-api');
let request = require('request')
let Twitter = require('twitter');
let fs = require('fs')
const inquirer = require("inquirer");

let client = new Twitter(keys.twitterKeys);

var spotify = new Spotify({
    id: "41fc319f4acb40c4876bfa50e4bf1302",
    secret: "261c1d0617ce46edaefc03cf274c005f"
});


/*Client ID
41fc319f4acb40c4876bfa50e4bf1302
Client Secret
261c1d0617ce46edaefc03cf274c005f*/
let liri = {
    log(text) {
        fs.appendFile("log.txt", text.reduce((acc, val) => acc + "  " + val, "") + "\r\n\r\n", (err) => {
            if (err) console.log(err)
        })
    }
}

liri["my-tweets"] = function() {
    client.get('statuses/user_timeline', { count: 20 }, function(error, tweets, response) {
        if (!error) {
            let allTweets = ["my-tweets"]
            tweets.forEach(function(tweet) {
                allTweets.push(tweet.text);
                console.log(tweet.text)
            })
            liri.log(allTweets)
        }
    });
}

liri["spotify-this-song"] = function(track) {
    spotify.search({ type: 'track', query: track ? track : "The Sign ace of base", limit: 1 }).then(function(response) {
            let artName = response.tracks.items[0].artists[0].name
            let trackName = response.tracks.items[0].name;
            let url = response.tracks.items[0].external_urls.spotify
            let albumName = response.tracks.items[0].album.name
            console.log(artName);
            console.log(trackName);
            console.log(url);
            console.log(albumName);
            liri.log(["spotify-this-song:", artName, trackName, url, albumName])

        })
        .catch(function(err) {
            console.log(error);
        });
}

liri["movie-this"] = function(movie) {
    movieName = movie ? movie : "mr.nobody"
    request(`http://www.omdbapi.com/?apikey=40e9cece&t=${movieName}`, function(error, response, body) {


        if (!error && response.statusCode === 200) {
            let json = JSON.parse(body);
            let title = "Title: " + json.Title;
            let year = "Year Released: " + json.Year;
            let imdb = "imdb Rating: " + json.Ratings[0].Value;
            let country = "Country: " + json.Country;
            let lang = "Language: " + json.Language
            let plot = "Plot: " + json.Plot;
            let actors = "Actors: " + json.Actors;
            let rt = "Cant find a URL so heres the Rotten Tomatoes score: " + json.Ratings[1].Value;
            console.log(title);
            console.log(year);
            console.log(imdb);
            console.log(country);
            console.log(lang);
            console.log(plot);
            console.log(actors);
            console.log(rt)
            liri.log(["movie-this", title, year, imdb, country, lang, plot, actors, rt])
        }
    });
}

liri["do-what-it-says"] = function() {
    fs.readFile("./random.txt", "utf8", function(err, data) {
        //split data
        let splitData = data.split(',');
        let newData = [];
        //remove newlines (\n), returns(/r), and " from text
        splitData.forEach((ele) => {
                newData.push(ele.replace(/\n|\r|"/g, ""))
            })
            //find a random starting point from the list of random commands
        let num = Math.floor(Math.random() * (newData.length / 2))
            //call command first one is command second is arg if need or blank
            // console.log(newData[num * 2], newData[num * 2 + 1])

        liri[newData[num * 2]](newData[num * 2 + 1])
    })
}

//liri["spotify-this-song"]("mr.brightside")
//liri["movie-this"]("holes")
//liri["my-tweets"]()

//convert query into single string
inquirer
    .prompt([{
            type: "list",
            message: "What would you like liri to do?",
            choices: ["do-what-it-says", "movie-this", "spotify-this-song", "my-tweets"],
            name: "command"
        }

    ]).then(function(response) {
        if (response.command === "movie-this" || response.command === "spotify-this-song") {
            inquirer.prompt([{
                type: "input",
                message: "What do you want me to search for?",
                name: "query"
            }]).then(function(nestRes) {
                liri[response.command](nestRes.query);
            })
        } else {
            liri[response.command]()
        }
    })

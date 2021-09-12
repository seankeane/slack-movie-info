const { App } = require("@slack/bolt");
const util = require('util');
const axios = require('axios');

require("dotenv").config();
// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

app.action('movie_button', async ({ ack, body, client }) => {
  try {
    await ack();

    // Call the views.open method using the WebClient passed to listeners
    const result = await client.views.open({
      trigger_id: body.trigger_id,
      view: modalView
    });
  } catch (error) {
    console.log("err")
    console.error(error);
  }
});

app.action('movie_select', async ({ ack, body, client }) => {
  try {
    await ack();
    //console.log(arguments.length);
    //console.log("body" + body);

    // Call the views.open method using the WebClient passed to listeners
    const result = await client.views.open({
      trigger_id: body.trigger_id,
      view: modalView
    });

    console.log(result);
  } catch (error) {
    console.log("err")
    console.error(error);
  }
});

app.options({'action_id': 'movie_select'}, async ({ options, ack }) => {
  let searchString = options.value.toLowerCase();

  let url = `https://api.themoviedb.org/3/search/movie?query=${searchString}&api_key=${process.env.MOVIE_DB_AUTH_KEY}&language=en-US&page=3&include_adult=false`;
  
  //axios implementation
  /*
  axios.get(url)
    .then(function (response) {
      //console.log(response);
      if (response.results) {
        let searchResults = Array.from(response.results, function(x) {
        console.log(x);
        let res = {
          "text": {
            "type": "plain_text",
            "text": x.title
          },
          "value": x.id
          };
          return res;
        });
        console.log(searchResults);
      }
      
    })
    .catch(function (error) {
      console.log(error);
    });
    */
  

  //dummy data
  const opt = [];

  //console.log("options:" + util.inspect(options, {depth: null}));

  //const opt = mockMovieData.filter(title => title.toLowerCase.includes(searchString));
  

  /*for(let i=0; i < 3; i++) {
    opt.push({
      "text": {
        "type": "plain_text",
        "text": `*this is plain_text text* ${i}`
      },
      "value": `value-${i}`
    });
  }*/

  for(let i=0; i < mockMovieData.length; i++) {
    opt.push({
      "text": {
        "type": "plain_text",
        "text": mockMovieData[i].title
      },
      "value": `${mockMovieData[i].id}`
    });
  }

  //console.log(opt);

  await ack({
    "options": opt
  });
});

app.action('movie_select', ({ ack }) => {
  ack();
});

app.view('movie_modal_submit', async ({ ack, body, payload, client }) => {
  try {
    await ack();

    let selectedMovieId = payload.state.values.movie_select_block.movie_select.selected_option.value;

    let url = `https://api.themoviedb.org/3/movie/${selectedMovieId}?api_key=${process.env.MOVIE_DB_AUTH_KEY}`;

    let selectedMovieTitle = "Movie Title";
    let selectedMovieReleaseDate = "Movie Release Date";
    let selectedDescription = "Movie Description";
    let selectedMoviePosterUrl = "https://s3-media3.fl.yelpcdn.com/bphoto/c7ed05m9lC2EmA3Aruue7A/o.jpg";


    // GET request with Axios to TMDB to get movie details
    axios.get(url)
    .then(function (response) {
      if (response) {
        //console.log("responsedata:" + util.inspect(response, {depth: null}));
        selectedMovieTitle = response.data.title;
        selectedDescription = response.data.overview;
        selectedMovieReleaseDate = response.data.release_date;
        selectedMoviePosterUrl = `https://image.tmdb.org/t/p/w600_and_h900_bestv2${response.data.poster_path}`;

        const messageBlock = [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "Here's the movie info you requested"
            }
          },
          {
            "type": "header",
            "text": {
              "type": "plain_text",
              "text": selectedMovieTitle,
              "emoji": true
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `*Release date*: ${selectedMovieReleaseDate}\n${selectedDescription}.`
            },
            "accessory": {
              "type": "image",
              "image_url": selectedMoviePosterUrl,
              "alt_text": "cute cat"
            }
          },
          {
            "type": "divider"
          }
        ];

        const result = client.chat.postMessage({
          channel: body.user.id,
          blocks: messageBlock,
          text: `Movie Title: ${selectedMovieTitle}, Release Date: ${selectedMovieReleaseDate}, Description: ${selectedDescription}`
        });
      }
      
    })
    .catch(function (error) {
      console.log(error);
    });

  } catch (error) {
    console.log("err")
    console.error(error);
  }
});

app.event('app_home_opened', async ({ event, client }) => {
  try {
    // Call views.publish with the built-in client
    const result = await client.views.publish({
      // Use the user ID associated with the event
      user_id: event.user,
      view: homeView
    });

    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
});

const homeView = {
  // Home tabs must be enabled in your app configuration page under "App Home"
  "type": "home",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Welcome to Movie Info!🎉*"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Click the button below to pick a movie!"
      }
    },
    {
      "type": "actions",
      "elements": [
      {
        "type":"button",
        "action_id":"movie_button",
        "text": {
          "type":"plain_text",
          "text":"Select a Movie!"
        }
      }]
    }
  ]
};

const modalView = {
  "title": {
    "type": "plain_text",
    "text": "Movie Info"
  },
  "submit": {
    "type": "plain_text",
    "text": "Submit"
  },
  "blocks": [
    {
      "type": "input",
      "block_id": "movie_select_block",
      "element": {
        "type": "external_select",
        "placeholder": {
          "type": "plain_text",
          "text": "Select an item",
          "emoji": true
        },
        "action_id": "movie_select",
        "min_query_length": 1
      },
      "label": {
        "type": "plain_text",
        "text": "Select a movie:",
        "emoji": true
      }
    }
  ],
  "type": "modal",
  "callback_id": "movie_modal_submit"
};

const mockMovieData = [
  {
   "title": "Avatar",
   "id": 19995
  },
  {
   "title": "Pirates of the Caribbean: At World's End",
   "id": 285
  },
  {
   "title": "Spectre",
   "id": 206647
  },
  {
   "title": "The Dark Knight Rises",
   "id": 49026
  },
  {
   "title": "John Carter",
   "id": 49529
  },
  {
   "title": "Spider-Man 3",
   "id": 559
  },
  {
   "title": "Tangled",
   "id": 38757
  },
  {
   "title": "Avengers: Age of Ultron",
   "id": 99861
  },
  {
   "title": "Harry Potter and the Half-Blood Prince",
   "id": 767
  },
  {
   "title": "Batman v Superman: Dawn of Justice",
   "id": 209112
  }
];

(async () => {
  const port = 3000
  // Start your app
  await app.start(process.env.PORT || port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();
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

  const opt = presetMovieData.filter(x => x.text.text.toLowerCase().includes(searchString));
  //console.log("searchString:" + searchString);
  //console.log("opt:" + util.inspect(opt, {depth: null}));

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
              "text": "Here's the movie info you requested!"
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

const presetMovieData = [
  {"text": {
    "type": "plain_text",
    "text": "Avatar"
    },
    "value": "19995"
  },
  {"text": {
    "type": "plain_text",
    "text": "Pirates of the Caribbean: At World's End"
    },
    "value": "285"
  },
  {"text": {
    "type": "plain_text",
    "text": "Spectre"
    },
    "value": "206647"
  },
  {"text": {
    "type": "plain_text",
    "text": "The Dark Knight Rises"
    },
    "value": "49026"
  },
  {"text": {
    "type": "plain_text",
    "text": "John Carter"
    },
    "value": "49529"
  },
  {"text": {
    "type": "plain_text",
    "text": "Spider-Man 3"
    },
    "value": "559"
  },
  {"text": {
    "type": "plain_text",
    "text": "Tangled"
    },
    "value": "38757"
  },
  {"text": {
    "type": "plain_text",
    "text": "Avengers: Age of Ultron"
    },
    "value": "99861"
  },
  {"text": {
    "type": "plain_text",
    "text": "Harry Potter and the Half-Blood Prince"
    },
    "value": "767"
  },
  {"text": {
    "type": "plain_text",
    "text": "Batman v Superman: Dawn of Justice"
    },
    "value": "209112"
  }];


(async () => {
  const port = 3000
  // Start your app
  await app.start(process.env.PORT || port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();
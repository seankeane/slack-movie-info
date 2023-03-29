const { App } = require("@slack/bolt");

const util = require("util");
const axios = require("axios");

const { HOME_VIEW, MODAL_VIEW } = require("./views");
const { PRESET_MOVIE_DATA } = require("./presetData");

require("dotenv").config();
// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

app.event('app_home_opened', async ({ event, client }) => {
  try {
    // Call views.publish with the built-in client
    const result = await client.views.publish({
      // Use the user ID associated with the event
      user_id: event.user,
      view: HOME_VIEW
    });
    console.log(result);
  }
  catch (error) {
    console.log("Error during app_home_opened event handling");
    console.error(error);
  }
});

app.action('movie_button', async ({ ack, body, client }) => {
  try {
    await ack();

    // Call the views.open method using the WebClient passed to listeners
    await client.views.open({
      trigger_id: body.trigger_id,
      view: MODAL_VIEW
    });
  } catch (error) {
    console.log("Error during movie_button action handling");
    console.error(error);
  }
});

app.options('movie_select', async ({ options, ack }) => {
  try {
    // get select search string and convert to lowercase to support includes method below
    const searchString = options.value.toLowerCase();

    // filter the saved data set based on the input search string and return array with only matching records
    const opt = PRESET_MOVIE_DATA.filter(movieRes => movieRes.text.text.toLowerCase().includes(searchString));
    console.log("Typeahead Search String" + searchString);
    console.log("Filter Results:" + util.inspect(opt, {depth: null}));

    // return filtered array as options and ack request
    await ack({
      "options": opt
    });
  } catch (error) {
    console.log("Error during movie_select options handling");
    console.error(error);
  }
});

app.view('movie_modal_submit', async ({ ack, body, payload, client }) => {
  try {
    await ack();

    const selectedMovieId = payload.state.values.movie_select_block.movie_select.selected_option.value;

    const response = await requestMovieDetailsFromTMDB(selectedMovieId);

    if (response && response.data) {
      const messageData = constructDMFromTMDBResponse(response.data);
      await sendDMToUser(client, body.user.id, messageData.messageBlock, messageData.backupMessageText);
    } else {
      console.error("Invalid response from TMDB request");
    }

  } catch (error) {
    console.log("Error during movie_modal_submit view handling");
    console.error(error);
  }
});

function constructDMFromTMDBResponse(data) {
  const selectedMovieTitle = data.title;
  const selectedDescription = data.overview;
  const selectedMovieReleaseDateString = data.release_date;
  // Convert yyyy-mm-dd date string to unix data to be used in date formatting in text block
  const selectedMovieReleaseDateUnix = new Date(selectedMovieReleaseDateString).getTime() / 1000;
  // Construct full image URL by appending poster_path to the standard static URI
  const selectedMoviePosterUrl = `https://image.tmdb.org/t/p/w600_and_h900_bestv2${data.poster_path}`;
  // Create a message text string to display as plain text fallback
  const backupMessageText = `Movie Title: ${selectedMovieTitle}, Release Date: ${selectedMovieReleaseDateString}, Description: ${selectedDescription}`;

  // Block Kit template amend to allow dynamic insertion of values from above varibales
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
        "text": `*Release date*: <!date^${selectedMovieReleaseDateUnix}^{date_short}|${selectedMovieReleaseDateString}>\n${selectedDescription}`
      },
      "accessory": {
        "type": "image",
        "image_url": selectedMoviePosterUrl,
        "alt_text": "Movie Poster"
      }
    },
    {
      "type": "divider"
    }
  ];

  // return object with message block and fallback text string
  return {messageBlock, backupMessageText};

}

function requestMovieDetailsFromTMDB(movieId) {
  try {
    // build request URL based on movie ID with auth key from env vars based as parameter
    const reqUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.MOVIE_DB_AUTH_KEY}`;
    return axios.get(reqUrl);
  } catch (error) {
    console.log("Error response from TMDB request");
    console.error(error);
  }
}

async function sendDMToUser(client, channel, block, text) {
  const dmResult = await client.chat.postMessage({
    channel: channel,
    blocks: block,
    text: text
  });

  // log success or failure based on ok status in result
  if (dmResult.ok) {
    console.log("DM sent successfully");
  } else {
    console.log("DM failed to send");
    console.log("DM result body:" + util.inspect(dmResult, {depth: null}));
  }
}

(async () => {
  const port = 3000
  // Start your app
  await app.start(process.env.PORT || port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();
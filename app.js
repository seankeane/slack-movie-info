const { App } = require("@slack/bolt");
const util = require('util');
require("dotenv").config();
// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

app.command("/knowledge", async ({ command, ack, say }) => {
    try {
      await ack();
      say("Yaaay! that command works!");
    } catch (error) {
      console.log("err")
      console.error(error);
    }
});

app.action('movie_button', async ({ ack, body, client }) => {
  try {
    await ack();
    console.log(arguments.length);
    console.log("body" + body);

    // Call the views.open method using the WebClient passed to listeners
    const result = await client.views.open({
      trigger_id: body.trigger_id,
      view: modalView
    });

    const openModalViewId = result.view.id;
    console.log("openModalViewId:" + openModalViewId);

    console.log(result);
  } catch (error) {
    console.log("err")
    console.error(error);
  }
});

app.action('movie_select', async ({ ack, body, client }) => {
  try {
    await ack();
    console.log(arguments.length);
    console.log("body" + body);

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
  const opt = []

  for(let i=0; i < 3; i++) {
    opt.push({
      "text": {
        "type": "plain_text",
        "text": `*this is plain_text text* ${i}`
      },
      "value": `value-${i}`
    });
  }

  ack({
    "options": opt
  });
});

app.action('movie_select', ({ ack }) => {
  ack();
});

app.view('movie_modal_submit', async ({ ack, event, body, payload, client }) => {
  try {
    await ack();

    console.log("event:" + util.inspect(event, {depth: null}));
    console.log("payload.state.values:" + util.inspect(payload.state.values, {depth: null}));
    console.log("body:" + util.inspect(body, {depth: null}));

    //temp just return the value of the selected row
    let selectedMovie = payload.state.values.movie_select_block.movie_select.selected_option.value;

    const result = await client.chat.postMessage({
    channel: body.user.id,
    text: selectedMovie
  });

  console.log("result:" + result);

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

const messageTemplate = {
  "blocks": [
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
        "text": "{Movie Title}",
        "emoji": true
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Release date: {Date}\n {Plot Description}."
      },
      "accessory": {
        "type": "image",
        "image_url": "https://pbs.twimg.com/profile_images/625633822235693056/lNGUneLX_400x400.jpg",
        "alt_text": "cute cat"
      }
    },
    {
      "type": "divider"
    }
  ]
};

(async () => {
  const port = 3000
  // Start your app
  await app.start(process.env.PORT || port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();
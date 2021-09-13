exports.HOME_VIEW = {
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

exports.MODAL_VIEW = {
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
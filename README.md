# versioneye-slack

Report VersionEye's information to Slack

[![npm version](https://img.shields.io/npm/v/versioneye-slack.svg)](https://www.npmjs.com/package/versioneye-slack)
[![npm downloads](https://img.shields.io/npm/dm/versioneye-slack.svg)](https://www.npmjs.com/package/versioneye-slack)
![Node.js Version Support](https://img.shields.io/badge/Node.js%20support-v4–v7-brightgreen.svg)
[![Build Status](https://travis-ci.org/miyajan/versioneye-slack.svg?branch=master)](https://travis-ci.org/miyajan/versioneye-slack)
[![Dependency Status](https://www.versioneye.com/user/projects/586261ba44ae0d003954e07f/badge.svg)](https://www.versioneye.com/user/projects/586261ba44ae0d003954e07f)
[![dependencies Status](https://david-dm.org/miyajan/versioneye-slack/status.svg)](https://david-dm.org/miyajan/versioneye-slack)
[![Coverage Status](https://coveralls.io/repos/github/miyajan/versioneye-slack/badge.svg?branch=master)](https://coveralls.io/github/miyajan/versioneye-slack?branch=master)
![License](https://img.shields.io/npm/l/versioneye-slack.svg)

## Description

You can post the following VersionEye's information to Slack.

* your latest notifications

You can use this tool from CLI or programmatically.

## Install

### CLI

```
$ npm install versioneye-slack -g
```

### programmatically

```
$ npm install versioneye-slack
```

## Usage

### CLI

```
$ versioneye-slack <options> <command>
```

#### Options

```
$ versioneye-slack -h
```

#### Environment Variables

You can path some options by environment variables. The command-line options are prior to environment variables.

* ```VERSIONEYE_API_KEY``` : equals to ```--versioneye-api-key```
* ```SLACK_WEBHOOK_URL``` : equals to ```--slack-webhook-url```

#### Sub-commands

##### notifications

Post the latest notifications to slack.

```
$ versioneye-slack notifications -h
```

The personal API key in your setting page (https://www.versioneye.com/settings/api) is required.

### programmatically

You can use the same functions programmatically.

```javascript
const VersionEyeSlack = require('versioneye-slack');

const versioneyeApiKey = '<api key for versioneye>';
const slackWebhookUrl = '<webhook url for slack>';
const versioneyeSlack = new VersionEyeSlack(versioneyeApiKey, slackWebhookUrl);
versioneyeSlack.postNotifications().then(response => {
    console.log(response);
});
```

* ```postNotifications``` : equals to ```versioneye-slack notifications```

All methods will return Promise. The response string will be passed to ```then``` method when the request succeeds. The Error object with message string will be passed to ```catch``` method when the request fails.

## Contribution

1. Fork
2. Create a feature branch
3. Commit your changes
4. Rebase your local changes against the master branch
5. Run `npm test`
6. Create new Pull Request

## License

MIT

## Author

[miyajan](https://github.com/miyajan): Jumpei Miyata miyajan777@gmail.com

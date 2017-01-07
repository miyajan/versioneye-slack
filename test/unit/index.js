'use strict';

const proxyquire = require('proxyquire');
const assert = require('assert');

describe('VersionEyeSlack class', function() {
    let sut;
    let versioneyeApiKey = 'versioneye-api-key-dummy';
    let slackWebhookUrl = 'https://hooks.slack.com/services/dummy/webhook/url';

    describe('postNotifications', function() {
        let actualOpts;

        beforeEach(function() {
            const VersionEyeSlack = proxyquire('../../index', {
                'versioneye-api-client': class {
                    constructor(apiKey, opt_baseUri) {
                        this.me = {
                            listNotifications: function() {
                                return Promise.resolve({
                                    "notifications": [
                                        {
                                            "read": true,
                                            "product": {
                                                "prod_key": "read_prod_key",
                                                "language": "read_language",
                                                "name": "read_name"
                                            },
                                            "version": "2.0.0"
                                        },
                                        {
                                            "read": false,
                                            "product": {
                                                "prod_key": "unread_prod_key",
                                                "language": "unread_language",
                                                "name": "unread_name"
                                            },
                                            "version": "1.0.0"
                                        }
                                    ]
                                });
                            }
                        }
                    }
                },
                'slack-incoming-webhook': function(opts) {
                    return function(message, opts, callback) {
                        actualOpts = opts;
                        process.nextTick(function() {
                            callback(null, 'mocked');
                        });
                    };
                }
            });
            sut = new VersionEyeSlack(versioneyeApiKey, slackWebhookUrl);
        });

        it.only('post unread notifications of VersionEye to Slack', function() {
            return sut.postNotifications().then(response => {
                assert(Array.isArray(actualOpts['attachments']));
                assert(actualOpts['attachments'].length === 1);
                assert(actualOpts['attachments'][0]['text'] === '<https://www.versioneye.com/unread_language/unread_prod_key|unread_name> (1.0.0)');
                assert(response === 'mocked');
            });
        });
    });
});

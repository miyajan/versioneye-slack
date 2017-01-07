'use strict';

const proxyquire = require('proxyquire');
const assert = require('assert');

let actualMessage;
let actualOpts;
const mockSlack = function(opts) {
    return function(message, opts, callback) {
        actualMessage = message;
        actualOpts = opts;
        process.nextTick(function() {
            callback(null, 'mocked');
        });
    };
};

describe('VersionEyeSlack class', function() {
    let sut;
    let versioneyeApiKey = 'versioneye-api-key-dummy';
    let slackWebhookUrl = 'https://hooks.slack.com/services/dummy/webhook/url';

    beforeEach(function() {
        actualMessage = null;
        actualOpts = null;
    });

    describe('postNotifications', function() {
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
                'slack-incoming-webhook': mockSlack
            });
            sut = new VersionEyeSlack(versioneyeApiKey, slackWebhookUrl);
        });

        it('post unread notifications of VersionEye to Slack', function() {
            return sut.postNotifications().then(response => {
                assert(actualMessage === 'There are notifications for new releases!');
                assert.deepEqual(actualOpts, {
                    'attachments': [{
                        'text': '<https://www.versioneye.com/unread_language/unread_prod_key|unread_name> (1.0.0)'
                    }]
                });
                assert(response === 'mocked');
            });
        });
    });

    describe('postProjectSummary', function() {
        beforeEach(function() {
            const VersionEyeSlack = proxyquire('../../index', {
                'versioneye-api-client': class {
                    constructor(apiKey, opt_baseUri) {
                        this.projects = {
                            list: function() {
                                return Promise.resolve([
                                    {
                                        "id": {
                                            "$oid": "project1-id"
                                        },
                                        "name": "project1"
                                    },
                                    {
                                        "id": {
                                            "$oid": "project2-id"
                                        },
                                        "name": "project2"
                                    }
                                ]);
                            },
                            show: function(projectId) {
                                return Promise.resolve({
                                    "id": projectId,
                                    "out_number_sum": 0,
                                    "licenses_red_sum": 0,
                                    "licenses_unknown_sum": 0,
                                    "sv_count_sum": 0
                                });
                            }
                        }
                    }
                },
                'slack-incoming-webhook': mockSlack
            });
            sut = new VersionEyeSlack(versioneyeApiKey, slackWebhookUrl);
        });

        it('Post a summary for the specific project', function() {
            return sut.postProjectSummary('project1').then(response => {
                assert(actualMessage === 'Project summary for <https://www.versioneye.com/user/projects/project1-id|project1>');
                assert.deepEqual(actualOpts, {
                    'attachments': [
                        {
                            color: 'good',
                            text: 'Outdated: 0'
                        },
                        {
                            color: 'good',
                            text: 'Licenses: 0 : 0'
                        },
                        {
                            color: 'good',
                            text: 'Security: 0'
                        }
                    ]
                });
                assert(response === 'mocked');
            });
        });
    });
});

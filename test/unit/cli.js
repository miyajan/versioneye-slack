'use strict';

const proxyquire = require('proxyquire');
const assert = require('assert');

describe('CLI', function() {
    let doExitCalled;
    const dummyConsole = {
        log: message => {},
        error: message => {}
    };
    const dummyExit = () => {
        doExitCalled = true;
    };

    beforeEach(function() {
        doExitCalled = false;
    });

    describe('no sub-command', function() {
        let CommandLine, sut, commanderStub, doOutputHelpCalled;

        beforeEach(function() {
            commanderStub = {};
            doOutputHelpCalled = false;
            CommandLine = require('../../lib/cli');
        });

        it('should print help and exit', function() {
            sut = new CommandLine(['/usr/local/bin/node', 'versioneye-slack.js'], {}, dummyConsole, dummyExit);

            let doOutputHelpCalled = false;
            sut._program.outputHelp = () => {
                doOutputHelpCalled = true;
            };

            sut.execute();
            assert(doOutputHelpCalled);
            assert(doExitCalled);
        });
    });

    describe('project sub-command', function() {
        let CommandLine, sut, passedVersioneyeApiKey, passedSlackWebhookUrl, passedVersioneyeHost, passedSlackChannel,
            passedProjectName;

        beforeEach(function() {
            passedVersioneyeApiKey = null;
            passedSlackWebhookUrl = null;
            passedVersioneyeHost = null;
            passedSlackChannel = null;
            passedProjectName = null;
            CommandLine = proxyquire('../../lib/cli', {
                '../index': class {
                    constructor(versioneyeApiKey, slackWebhookUrl, opt_versioneyeHost, opt_slackChannel) {
                        passedVersioneyeApiKey = versioneyeApiKey;
                        passedSlackWebhookUrl = slackWebhookUrl;
                        passedVersioneyeHost = opt_versioneyeHost;
                        passedSlackChannel = opt_slackChannel;
                    }

                    postProjectSummary(projectName) {
                        passedProjectName = projectName;
                        return Promise.resolve('mocked');
                    }
                }
            });
        });

        it('call postProjectSummary of VersionEyeSlack', function() {
            sut = new CommandLine(['/usr/local/bin/node', 'versioneye-slack.js', 'project', 'test-project', '--versioneye-api-key', 'test-versioneye-api-key',
                '--slack-webhook-url', 'test-slack-webhook-url', '--versioneye-host', 'test-versioneye-host',
                '--slack-channel', 'test-slack-channel'], {}, dummyConsole, () => {});
            sut.execute();
            assert(passedProjectName === 'test-project');
            assert(passedVersioneyeApiKey === 'test-versioneye-api-key');
            assert(passedSlackWebhookUrl === 'test-slack-webhook-url');
            assert(passedVersioneyeHost === 'test-versioneye-host');
            assert(passedSlackChannel === 'test-slack-channel');
        });
    });

    describe('notifications sub-command', function() {
        let CommandLine, sut, passedVersioneyeApiKey, passedSlackWebhookUrl, passedVersioneyeHost, passedSlackChannel,
            areNotificationsPosted;

        beforeEach(function() {
            passedVersioneyeApiKey = null;
            passedSlackWebhookUrl = null;
            passedVersioneyeHost = null;
            passedSlackChannel = null;
            areNotificationsPosted = false;
            CommandLine = proxyquire('../../lib/cli', {
                '../index': class {
                    constructor(versioneyeApiKey, slackWebhookUrl, opt_versioneyeHost, opt_slackChannel) {
                        passedVersioneyeApiKey = versioneyeApiKey;
                        passedSlackWebhookUrl = slackWebhookUrl;
                        passedVersioneyeHost = opt_versioneyeHost;
                        passedSlackChannel = opt_slackChannel;
                    }

                    postNotifications() {
                        areNotificationsPosted = true;
                        return Promise.resolve('mocked');
                    }
                }
            });
        });

        it('call postNotifications of VersionEyeSlack', function() {
            sut = new CommandLine(['/usr/local/bin/node', 'versioneye-slack.js', 'notifications', '--versioneye-api-key', 'test-versioneye-api-key',
                '--slack-webhook-url', 'test-slack-webhook-url', '--versioneye-host', 'test-versioneye-host',
                '--slack-channel', 'test-slack-channel'], {}, dummyConsole, () => {});
            sut.execute();
            assert(areNotificationsPosted);
            assert(passedVersioneyeApiKey === 'test-versioneye-api-key');
            assert(passedSlackWebhookUrl === 'test-slack-webhook-url');
            assert(passedVersioneyeHost === 'test-versioneye-host');
            assert(passedSlackChannel === 'test-slack-channel');
        });
    });
});

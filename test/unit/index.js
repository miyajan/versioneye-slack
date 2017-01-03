'use strict';

const VersionEyeSlack = require('../../index');
const assert = require('assert');

describe('VersionEyeSlack class', function() {
    let sut;
    let versioneyeApiKey = 'versioneye-api-key-dummy';
    let slackWebhookUrl = 'slack-webhook-url-dummy';

    beforeEach(function() {
        sut = new VersionEyeSlack(versioneyeApiKey, slackWebhookUrl);
    });

    it('is instantiatable', function() {
        assert(sut instanceof VersionEyeSlack);
    });
});

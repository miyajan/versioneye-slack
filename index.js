'use strict';

const VersionEye = require('versioneye-api-client');
const slack = require('slack-incoming-webhook');

/**
 * Class to report VersionEye's information to Slack
 */
class VersionEyeSlack {
    /**
     * Constructor
     * @param {string} versioneyeApiKey API key for VersionEye
     * @param {string} slackWebhookUrl Webhook URL for Slack
     * @param {?string=} opt_versioneyeHost Host for VersionEye (default: https://www.versioneye.com)
     * @param {?string=} opt_slackChannel Channel name for Slack
     */
    constructor(versioneyeApiKey, slackWebhookUrl, opt_versioneyeHost, opt_slackChannel) {
        this._versioneyeHost = opt_versioneyeHost || 'https://www.versioneye.com';
        this._versioneye = new VersionEye(versioneyeApiKey, this._versioneyeHost + '/api/v2');
        this._slack = slack({
            url: slackWebhookUrl,
            channel: opt_slackChannel,
            icon_url: 'https://raw.githubusercontent.com/miyajan/versioneye-slack/master/image/versioneye.png'
        });
    }

    /**
     * Post notifications of VersionEye to Slack
     * @param {!Date} opt_lastNotifiedTime Post only notifications created after the specific time
     * @return {!Promise}
     */
    postNotifications(opt_lastNotifiedTime) {
        return this._versioneye.me.listNotifications().then(json => {
            const attachments = [];
            json['notifications'].forEach(notification => {
                const createdAt = Date.parse(notification['created_at']);
                if (opt_lastNotifiedTime && opt_lastNotifiedTime > createdAt) {
                    // already notified
                    return;
                }
                const productKey = notification['product']['prod_key'];
                const language = notification['product']['language'];
                const url = this._versioneyeHost + '/' + language + '/' + productKey;
                const name = notification['product']['name'];
                const version = notification['version'];
                attachments.push({
                    text: '<' + url + '|' + name + '> (' + version + ')'
                });
            });

            if (attachments.length > 0) {
                return new Promise((resolve, reject) => {
                    // post to slack
                    this._slack('There are notifications for new releases!', {
                        attachments: attachments
                    }, (err, response) => {
                        if (err) {
                            return reject(err); // Error with message
                        }
                        return resolve(response); // 'ok'
                    });
                });
            }

            return Promise.resolve('no notifications');
        });
    }
}

module.exports = VersionEyeSlack;

'use strict';

const program = require('commander');
const VersionEyeSlack = require('../index');
const pkg = require('../package.json');

/**
 * Print help and exit with 1
 * @param {!Function} exit Function to exit
 */
function printHelpAndExit(exit) {
    program.outputHelp();
    exit(1);
}

/**
 * Setup VersionEyeSlack instance
 * @param {!Object} options Options
 * @param {!Object} env Environment Variables
 * @param {!Function} exit Function to exit
 * @return {!VersionEyeSlack}
 */
function setupVersioneyeSlack(options, env, exit) {
    const versioneyeApiKey = options.versioneyeApiKey || env.VERSIONEYE_API_KEY;
    const slackWebhookUrl = options.slackWebhookUrl || env.SLACK_WEBHOOK_URL;
    const versioneyeHost = options.versioneyeHost;
    const slackChannel = options.slackChannel;

    if (!versioneyeApiKey || !slackWebhookUrl) {
        printHelpAndExit(exit);
    }

    return new VersionEyeSlack(versioneyeApiKey, slackWebhookUrl, versioneyeHost, slackChannel);
}

/**
 * Main
 * @param {!Array} argv Arguments
 * @param {!Object} env Environment Variables
 * @param {!Function} exit Function to exit
 */
function main(argv, env, exit) {
    program
        .version(pkg.version, '-v, --version')
        .option('--versioneye-api-key <key>', 'API key for VersionEye')
        .option('--slack-webhook-url <url>', 'Webhook URL for Slack')
        .option('--versioneye-host <host>', 'Host for VersionEye (default: https://www.versioneye.com)')
        .option('--slack-channel <channel>', 'Channel name for Slack')
        .action(options => {
            // unknown sub-commands
            printHelpAndExit(exit);
        });

    program.command('project [projectName]')
        .description('Post a project summary of VersionEye to Slack')
        .action((projectName, options) => {
            if (!projectName || program.args.length !== 2) {
                printHelpAndExit(exit);
            }

            const versioneyeSlack = setupVersioneyeSlack(options, env, exit);
            versioneyeSlack.postProjectSummary(projectName).then(response => {
                console.log(response);
            }).catch(err => {
                console.error(err.message);
                exit(1);
            });
        });

    program.command('notifications')
        .description('Post notifications of VersionEye to Slack')
        .option('--last-notified-time <dateString>', 'Post only notifications created after the time')
        .action(options => {
            if (program.args.length !== 1) {
                // any unknown arguments
                printHelpAndExit(exit);
            }

            const versioneyeSlack = setupVersioneyeSlack(options, env, exit);

            let lastNotifiedTime;
            if (options.lastNotifiedTime) {
                lastNotifiedTime = Date.parse(options.lastNotifiedTime);
                if (!lastNotifiedTime) {
                    console.error(options.lastNotifiedTime + ' can not be parsed. Use ISO 8601 syntax.');
                    exit(1);
                }
            }

            versioneyeSlack.postNotifications(lastNotifiedTime).then(response => {
                console.log(response);
            }).catch(err => {
                console.error(err.message);
                exit(1);
            });
        });

    program.parse(argv);

    if (program.args.length === 0) {
        // no sub-commands
        printHelpAndExit(exit);
    }
}

module.exports = main;

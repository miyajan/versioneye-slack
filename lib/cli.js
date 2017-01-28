'use strict';

const commander = require('commander');
const VersionEyeSlack = require('../index');
const pkg = require('../package.json');

class CommandLine {
    /**
     * Constructor
     * @param {!Array} argv Arguments
     * @param {!Object} env Environment Variables
     * @param {!Console} console
     * @param {!Function} exit Function to exit
     */
    constructor(argv, env, console, exit) {
        this._argv = argv;
        this._env = env;
        this._console = console;
        this._exit = exit;
        this._program = new commander.Command();
    }

    /**
     * Execute a command
     */
    execute() {
        this._program
            .version(pkg.version, '-v, --version')
            .option('--versioneye-api-key <key>', 'API key for VersionEye')
            .option('--slack-webhook-url <url>', 'Webhook URL for Slack')
            .option('--versioneye-host <host>', 'Host for VersionEye (default: https://www.versioneye.com)')
            .option('--slack-channel <channel>', 'Channel name for Slack')
            .action(options => {
                // unknown sub-commands
                this._printHelpAndExit();
            });

        this._program
            .command('project [projectName]')
            .option('-o, --org-name <name>', 'Organization name the project is assigned to (This options is required when you execute with a personal API key)')
            .description('Post a project summary of VersionEye to Slack')
            .action((projectName, options) => {
                if (!projectName || this._program.args.length !== 2) {
                    this._printHelpAndExit();
                }

                const orgName = options.orgName;

                const versioneyeSlack = this._setupVersioneyeSlack(options.parent);
                versioneyeSlack.postProjectSummary(projectName, orgName).then(response => {
                    this._console.log(response);
                }).catch(err => {
                    this._console.error(err.message);
                    this._exit(1);
                });
            });

        this._program
            .command('notifications')
            .description('Post notifications of VersionEye to Slack')
            .action(options => {
                if (this._program.args.length !== 1) {
                    // any unknown arguments
                    this._printHelpAndExit();
                }

                const versioneyeSlack = this._setupVersioneyeSlack(options.parent);
                versioneyeSlack.postNotifications().then(response => {
                    this._console.log(response);
                }).catch(err => {
                    this._console.error(err.message);
                    this._exit(1);
                });
            });

        this._program.parse(this._argv);

        if (this._program.args.length === 0) {
            // no sub-commands
            this._printHelpAndExit();
        }
    }

    /**
     * Print help and exit with 1
     * @private
     */
    _printHelpAndExit() {
        this._program.outputHelp();
        this._exit();
    }

    /**
     * Setup VersionEyeSlack instance
     * @param {!Object} options Options
     * @return {!VersionEyeSlack}
     * @private
     */
    _setupVersioneyeSlack(options) {
        const versioneyeApiKey = options.versioneyeApiKey || this._env.VERSIONEYE_API_KEY;
        const slackWebhookUrl = options.slackWebhookUrl || this._env.SLACK_WEBHOOK_URL;
        const versioneyeHost = options.versioneyeHost;
        const slackChannel = options.slackChannel;

        if (!versioneyeApiKey || !slackWebhookUrl) {
            this._printHelpAndExit();
        }

        return new VersionEyeSlack(versioneyeApiKey, slackWebhookUrl, versioneyeHost, slackChannel);
    }
}

module.exports = CommandLine;

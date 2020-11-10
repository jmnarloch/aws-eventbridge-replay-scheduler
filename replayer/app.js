const aws = require('aws-sdk');
const parser = require('cron-parser');
const uuid = require('uuid');
const events = new aws.EventBridge();

/**
 * Replay Lambda Function that triggers the Archive Replay from the beginning of the previous cron tick till the most recent schedule time.
 * The events are being replayed to the
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - EventBridge Scheduled Event
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * @returns {Object} object
 *
 */
exports.lambdaHandler = async (event, context) => {
    const archive = process.env.AWS_EVENTBRIDGE_ARCHIVE_ARN;
    const eventBus = process.env.AWS_EVENTBRIDGE_EVENT_BUS_ARN;
    const schedule = process.env.AWS_EVENTBRIDGE_REPLAY_SCHEDULE;

    let cron = parser.parseExpression(schedule);
    let replayEndTime = cron.prev();
    let replayStartTime = cron.prev();

    console.log("Replaying events from %s to %s with event time between [%s, %s]",
        archive, eventBus, replayStartTime, replayEndTime);

    await events.startReplay({
        ReplayName: uuid.v4(),
        EventSourceArn: archive,
        Destination: {
            Arn: eventBus
        },
        EventStartTime: replayStartTime.toDate(),
        EventEndTime: replayEndTime.toDate()
    });

    return {};
};

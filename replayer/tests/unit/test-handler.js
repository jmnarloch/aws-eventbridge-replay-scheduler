'use strict';

const AWSMock = require('aws-sdk-mock');
const app = require('../../app.js');
const chai = require('chai');
const expect = chai.expect;
var event, context;

describe('Tests index', function () {
    before(function () {
        process.env.AWS_EVENTBRIDGE_ARCHIVE_ARN = 'arn:aws:events:us-east-1:123456789012:archive/archive';
        process.env.AWS_EVENTBRIDGE_EVENT_BUS_ARN = 'arn:aws:events:us-east-1:123456789012:event-bus/event-bus';
        process.env.AWS_EVENTBRIDGE_REPLAY_SCHEDULE = '0 0 1 * * *';

        AWSMock.mock('EventBridge', 'StartReplay', function (params, callback) {
            callback(null, 'Sucessfully started replay');
        });
    });

    after(function () {
        delete process.env.AWS_EVENTBRIDGE_ARCHIVE_ARN;
        delete process.env.AWS_EVENTBRIDGE_EVENT_BUS_ARN;
        delete process.env.AWS_EVENTBRIDGE_REPLAY_SCHEDULE;

        AWSMock.restore('EventBridge');
    });

    it('verifies successful response', async () => {

        const result = await app.lambdaHandler(event, context)

        expect(result).to.be.an('object');
    });
});

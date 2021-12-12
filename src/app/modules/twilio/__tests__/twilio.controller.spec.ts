/* eslint-disable import/first */
import { mocked } from 'ts-jest/utils'

import * as LoggerModule from 'src/app/config/logger'

import expressHandler from 'tests/unit/backend/helpers/jest-express'
import getMockLogger from 'tests/unit/backend/helpers/jest-logger'

const MockLoggerModule = mocked(LoggerModule, true)
const mockLogger = getMockLogger()

jest.mock('src/app/config/logger')
MockLoggerModule.createLoggerWithLabel.mockReturnValue(mockLogger)

import { twilioSmsUpdates } from 'src/app/modules/twilio/twilio.controller'
import { ITwilioSmsWebhookBody } from 'src/types'

describe('twilio.controller', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  const MOCK_SUCCESSFUL_MESSAGE: ITwilioSmsWebhookBody = {
    SmsSid: '12345',
    SmsStatus: 'delivered',
    MessageStatus: 'delivered',
    To: '+12345678',
    MessageSid: 'SM212312',
    AccountSid: 'AC123456',
    From: '+12345678',
    ApiVersion: '2011-11-01',
  }

  const MOCK_FAILED_MESSAGE: ITwilioSmsWebhookBody = {
    SmsSid: '12345',
    SmsStatus: 'failed',
    MessageStatus: 'failed',
    To: '+12345678',
    MessageSid: 'SM212312',
    AccountSid: 'AC123456',
    From: '+12345678',
    ApiVersion: '2011-11-01',
    ErrorCode: 30001,
    ErrorMessage: 'Twilio is down!',
  }

  describe('twilioSmsUpdates', () => {
    it('should return 200 when successfully delivered message is sent', async () => {
      const mockReq = expressHandler.mockRequest({
        body: MOCK_SUCCESSFUL_MESSAGE,
      })
      const mockRes = expressHandler.mockResponse()
      await twilioSmsUpdates(mockReq, mockRes, jest.fn())

      expect(mockLogger.info).toBeCalledWith({
        message: 'Sms Delivery update',
        meta: {
          action: 'twilioSmsUpdates',
          body: MOCK_SUCCESSFUL_MESSAGE,
        },
      })
      expect(mockLogger.error).not.toBeCalled()
      expect(mockRes.sendStatus).toBeCalledWith(200)
    })

    it('should return 200 when failed delivered message is sent', async () => {
      const mockReq = expressHandler.mockRequest({
        body: MOCK_FAILED_MESSAGE,
      })
      const mockRes = expressHandler.mockResponse()
      await twilioSmsUpdates(mockReq, mockRes, jest.fn())

      expect(mockLogger.info).not.toBeCalled()
      expect(mockLogger.error).toBeCalledWith({
        message: 'Error occurred when attempting to send SMS on twillio',
        meta: {
          action: 'twilioSmsUpdates',
          body: MOCK_FAILED_MESSAGE,
        },
      })
      expect(mockRes.sendStatus).toBeCalledWith(200)
    })
  })
})
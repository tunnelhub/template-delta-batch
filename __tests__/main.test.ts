import { mocked } from 'ts-jest/utils';
import * as main from '../src';
import { DeltaIntegrationFlow } from '@4success/tunnelhub-sdk/src/classes/flows/deltaIntegrationFlow';
import AutomationLog from '@4success/tunnelhub-sdk/src/classes/logs/automationLog';
import AutomationDelta from '@4success/tunnelhub-sdk/src/classes/logs/automationDelta';
import got from 'got';
import * as mysql from 'mysql';
import { AutomationExecution } from '@4success/tunnelhub-sdk';

jest.mock('got');
jest.mock('mysql');

const mockedGot = mocked(got, true);
const mockedMysql = mocked(mysql, true);

beforeAll(() => {
  /**
   * The code bellow is ** mandatory ** to avoid TunnelHub SDK make external calls trying persist logs
   * You can make this mock using the same code with any IntegrationFlow at @4success/tunnelhub-sdk/classes/flows
   */
  const persistLambdaContextFunc = jest.spyOn(AutomationExecution as any, 'persistLambdaContext');
  persistLambdaContextFunc.mockImplementation(() => {
  });

  const persistLogsFunc = jest.spyOn(AutomationLog.prototype as any, 'save');
  persistLogsFunc.mockImplementation(() => {
  });

  const saveDelta = jest.spyOn(AutomationDelta.prototype as any, 'save');
  saveDelta.mockImplementation(() => {
  });

  const readDelta = jest.spyOn(AutomationDelta.prototype as any, 'read');
  readDelta.mockImplementation(() => {
    throw new Error('No delta')
  });

  const updateExecutionStatisticsFunc = jest.spyOn(DeltaIntegrationFlow.prototype as any, 'updateExecutionStatistics');
  updateExecutionStatisticsFunc.mockImplementation(() => {
  });

  const updateMetadata = jest.spyOn(DeltaIntegrationFlow.prototype as any, 'updateMetadata');
  updateMetadata.mockImplementation(() => {
  });
});

type CallbackFunction = (error: any | null, results: any[], fields: string[]) => void;

test('testOnyInserts', async () => {
  /***
   * Mocking mysql class and got
   */
  //@ts-ignore - is not necessary return all methods
  mockedMysql.createConnection.mockImplementation(() => {
    return {
      query: (query: string, values?: string[] | CallbackFunction, callback?: CallbackFunction) => {
        switch (query) {
          case 'SELECT * FROM covidCases':
            if (typeof callback === 'function') {
              callback(null, [], []);
            } else if (typeof values === 'function') {
              values(null, [], []);
            }
            break;
          default:
            if (typeof callback === 'function') {
              callback(null, [], []);
            } else if (typeof values === 'function') {
              values(null, [], []);
            }
        }
      },
      end: () => {

      },
    };
  });

  //@ts-ignore - is not necessary return all methods
  mockedGot.mockReturnValue({ body: JSON.stringify(require('./data/covidCases.json')) });
  /**
   * Calling my function
   */
  const response = await main.handler({}, {});

  expect(response.statusCode).toEqual(200);
  expect(typeof response.body).toBe('string');

  expect(response.body).toEqual('Automation executed with no errors!');
});
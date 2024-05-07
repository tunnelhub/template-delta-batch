import Integration from '../../src/classes/integration';
import { AutomationExecution } from '@tunnelhub/sdk';
import AutomationLog from '@tunnelhub/sdk/src/classes/logs/automationLog';
import AutomationDelta from '@tunnelhub/sdk/src/classes/logs/automationDelta';
import { DeltaIntegrationFlow } from '@tunnelhub/sdk/src/classes/flows/deltaIntegrationFlow';
import type { BatchWriteCommandOutput } from '@aws-sdk/lib-dynamodb';

describe('test src/integration', () => {
  beforeAll(() => {
    /**
     * The code below is mandatory to avoid TunnelHub SDK making external calls trying to persist logs
     * You can make this mock using the same code with any IntegrationFlow at @tunnelhub/sdk/classes/flows
     */
    const persistLambdaContextFunc = jest.spyOn(AutomationExecution as any, 'persistLambdaContext');
    persistLambdaContextFunc.mockImplementation(() => {
    });

    const persistLogsFunc = jest.spyOn(AutomationLog.prototype as any, 'save');
    persistLogsFunc.mockImplementation(() => {
    });

    const persistLogsFuncBatch = jest.spyOn(AutomationLog, 'saveInDynamoDB');
    persistLogsFuncBatch.mockResolvedValue({} as BatchWriteCommandOutput);

    const saveDelta = jest.spyOn(AutomationDelta.prototype as any, 'save');
    saveDelta.mockImplementation(() => {
    });

    const readDelta = jest.spyOn(AutomationDelta.prototype as any, 'read');
    readDelta.mockImplementation(() => {
      throw new Error('No delta');
    });

    const updateExecutionStatisticsFunc = jest.spyOn(DeltaIntegrationFlow.prototype as any, 'updateExecutionStatistics');
    updateExecutionStatisticsFunc.mockImplementation(() => {
    });

    const updateMetadata = jest.spyOn(DeltaIntegrationFlow.prototype as any, 'updateMetadata');
    updateMetadata.mockImplementation(() => {
    });
  });

  test('successfully test', async () => {
    const integration = new Integration({}, {});
    await expect(integration.doIntegration(undefined)).resolves.not.toThrow();
    expect(integration.hasAnyErrors()).toBeFalsy();
  });
});
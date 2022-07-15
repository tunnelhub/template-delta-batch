import Integration from '../../src/classes/integration';
import { AutomationExecution } from '@4success/tunnelhub-sdk';
import AutomationLog from '@4success/tunnelhub-sdk/src/classes/logs/automationLog';
import AutomationDelta from '@4success/tunnelhub-sdk/src/classes/logs/automationDelta';
import { DeltaIntegrationFlow } from '@4success/tunnelhub-sdk/src/classes/flows/deltaIntegrationFlow';

describe('test src/integration', () => {
  beforeAll(() => {
    /**
     * The code below is mandatory to avoid TunnelHub SDK making external calls trying to persist logs
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
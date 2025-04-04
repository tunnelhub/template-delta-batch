import {
  AutomatedIntegrationParameters,
  BatchDeltaIntegrationFlow,
  IntegrationMessageReturnBatch,
  Metadata,
  TunnelHubSystem,
} from '@tunnelhub/sdk';
import { IntegrationModel } from '../types/integration';
import metadata from '../metadata';

export default class Integration extends BatchDeltaIntegrationFlow<IntegrationModel> {
  private static keyFields: Array<keyof IntegrationModel> = [
    'key_field',
  ];
  private static deltaFields: Array<keyof IntegrationModel> = [
    'regular_field',
  ];

  private readonly parameters: AutomatedIntegrationParameters;
  private readonly systems: TunnelHubSystem[];

  constructor(event: any, context: any) {
    super(event, Integration.keyFields, Integration.deltaFields, context);
    this.systems = event.systems ?? [];
    this.parameters = event.parameters ?? {};
    this.packageSize = 50.;
    /**
     this.
     * It is mandatory to have the constructor call the super with the event of the main handler.
     * You can get the systems configured in automation and save them in a class attribute for further use.
     * You also can define the package size for batch items.
     */
  }

  /* istanbul ignore next */
  defineMetadata(): Metadata[] {
    return metadata;
  }


  async loadSourceSystemData(payload?: any): Promise<IntegrationModel[]> {
    /**5
     * Return the source system data as a plain array of objects
     *
     * This is the method where you will extract your source data
     * If your automation is a webhook, the payload sent will be available in the "payload" parameter.
     *
     * The implementation of this method is mandatory
     */
    return [];
  }

  async loadTargetSystemData(): Promise<IntegrationModel[]> {
    /**
     * Returns target source system data as a plain array of objects
     * This is the method where you will extract your target data for delta calculation
     */
    return [];
  }

  async batchInsertAction(packedItems: IntegrationModel[]): Promise<IntegrationMessageReturnBatch[]> {
    const returnMessages: IntegrationMessageReturnBatch[] = [];

    for (let i = 0; i < packedItems.length; i++) {
      const item = packedItems[i];
      /**
       * Create new items in the target system and return a message array to the monitoring
       */
      try {
        returnMessages.push({
          status: 'SUCCESS',
          data: {},
          message: 'Inserted successfully',
        });
      } catch (e) {
        returnMessages.push({
          status: 'FAIL',
          data: {},
          message: e.message,
        });
      }
    }

    return returnMessages;
  }

  async batchUpdateAction(oldPackedItems: IntegrationModel[], newPackedItems: IntegrationModel[]): Promise<IntegrationMessageReturnBatch[]> {
    const returnMessages: IntegrationMessageReturnBatch[] = [];

    for (let i = 0; i < newPackedItems.length; i++) {
      const oldItem = newPackedItems[i];
      const newItem = newPackedItems[i];
      /**
       * Update existing items in the target system and return a message to the monitoring
       */
      try {
        returnMessages.push({
          status: 'SUCCESS',
          data: {},
          message: 'Updated successfully',
        });
      } catch (e) {
        returnMessages.push({
          status: 'FAIL',
          data: {},
          message: e.message,
        });
      }
    }

    return returnMessages;
  }

  async batchDeleteAction(packedItems: IntegrationModel[]): Promise<IntegrationMessageReturnBatch[]> {
    const returnMessages: IntegrationMessageReturnBatch[] = [];

    for (let i = 0; i < packedItems.length; i++) {
      const item = packedItems[i];
      /**
       * Delete existing items in the target system not extracted from the source system and return a message to the monitoring
       */
      try {
        returnMessages.push({
          status: 'SUCCESS',
          data: {},
          message: 'Delete successfully',
        });
      } catch (e) {
        returnMessages.push({
          status: 'FAIL',
          data: {},
          message: e.message,
        });
      }
    }

    return returnMessages;
  }
}

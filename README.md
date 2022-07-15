# Template -  Delta Batch Integration Flow
![Coverage](coverage/badge.svg)
## NodejS  / Typescript

This is a basic template for automations of type "Delta Batch". Use it as a start point for your automation.

The "Delta" integration flow extract data from one or more sources, process all items at once, and save this execution
result as a delta image.
The subsequent execution will consider only changes between the last extraction.

It is designed for maximum flexibility but has an "all or nothing" behavior. This flow saves much processing time using
delta images but uses more memory.

### Default configuration:

* Environment: nodejs14.x
* Memory: 128mb
* Timeout: 60s

You can personalize these settings in the **tunnelhub.yml** file.

### Intructions:

* You can install all dependencies with `npm install` or `yarn`.
* Your main logic is in the `src/index.ts` file.
* You can check our example test in `__tests__` folder. Our tests are written
  using [Jest](https://www.npmjs.com/package/jest).
* To run your tests, just run `yarn run test`
* To deploy your automation, zip all your project in a zip file. Use `yarn run build` to transpile all your code and
  libraries using esbuild and save it in `dist` folder.
* Check our [documentation](https://docs.tunnelhub.io) for more information.

To deploy, execute the command:

* `yarn run build && th deploy-automation --env ENVNAME --message "Deploy message"`

For convenience, was created some helper scripts:

* For DEV environment: `yarn run deploy:dev --message "Deploy message"`
* For PRD environment: `yarn run deploy:prd --message "Deploy message"`

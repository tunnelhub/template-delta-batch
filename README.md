# Template -  Delta Batch Integration Flow
## NodejS  / Typescript

This is a basic template for automations of type "Delta Batch". Use it as a start point of your automation.

The "Delta" integration flow basically extract data from one or more sources, process all items at once and save this execution result as a delta image.
In the next execution, it will consider only changes between the last extraction.

It is designed for maximum flexibility but have a behavior of 'all or nothing'. This flow save a lot of processing time using delta images but use more memory.

### Default configuration:
* Environment: nodejs14.x
* Memory: 128mb
* Timeout: 60s

You can personalize this settings in tunnelhub.yml file

### Intructions:
* You can install all dependencies with `npm install` or `yarn`.
* Your main logic is in `src/index.ts` file. 
* You can check our example test in `__tests__` folder. Our tests are writted using [Jest](https://www.npmjs.com/package/jest). 
* To run your tests, just run `npm run test`
* To deploy your automation, it's necessary zip all your project in a zip file. Use `npm run build` to transpile all your code and libraries using babel and save it in `dist` folder.

Your preferred deploy command:
* `npm run build && th deploy-automation --env ENVNAME --message "Deploy message"`

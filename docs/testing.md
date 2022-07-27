# Testing

In MMH we use a combination of [jest](https://jestjs.io/) and
[@testing-library](https://testing-library.com/) to write both functional and integration
tests within our React code. These tests are apart of our pipeline and act as quality
gates to releasing for deployments.

## Collocation

Tests are generally collocated to be in the same directory as the file they are testing,
and similarly named with the addition of either `.test.js` or `.spec.js` appended to the
file name.

## API mocking

We leverage Mock Service Worker (msw) in our tests for mocking api responses. We have a
collection of premade handlers and mock data in the
[@hackney/mtfh-test-utils](https://github.com/LBHackney-IT/mtfh-frontend/tree/main/packages/test-utils#readme)
library in the monorepo.

## Basic Setup

Generally in a micro-frontend you will setup a `src/test-utils.ts` file to setup all the
mock handlers for your tests. You will want to add this file to your `jest.config.js` file
in the `setupFilesAfterEnv` property.

```ts
import { server, getPersonV1 } from "@hackney/mtfh-test-utils";

beforeEach(() => {
  server.use(getPersonV1());
});
```

In the above code, we have imported the configured server for [msw](https://mswjs.io/)
where intitally no handlers are registered. The `beforeEach` hook ensures we setup the
handlers for each test (as we may have made changes for specific tests). We have also
imported the `getPersonV1` handler which will intercept `GET` requests made to the V1
person api. This handler is pre-configured to return a `mockPersonV1` entity.

To modify the default response we could do something like the below:

```ts
import { server, getPersonV1, generateMockPersonV1 } from "@hackney/mtfh-test-utils";

const mockMinor = generateMockPersonV1({
  dateOfBirth: "2010-01-01",
});

beforeEach(() => {
  server.use(getPersonV1(mockMinor));
});
```

## E2E Testing

We use Cypress for E2E testing within MME, for the most part this has been documented in
detail in `mtfh-tl-e2e-tests` repo. The tests are currently separated from the
micro-frontends as we want to test complete journeys and there for require multiple
micro-frontends. So we run these tests post deployment.

## E2E in the future

We have been experimenting with a new approach for E2E testing, where we bring Cypress
into the micro-frontend. This has been done by
[mtfh-frontend-header](https://github.com/LBHackney-IT/mtfh-frontend-header), as a low
impact proof of concept. Ideally we would want this approach to be migrated through the
different micro-frontends, as it gives more direct feedback to the developer and can run
E2E test before deployment.

We go into more detail on how the above is possible in
[@hackney/mtfh-cypress](https://github.com/LBHackney-IT/mtfh-frontend/tree/main/packages/cypress#readme)

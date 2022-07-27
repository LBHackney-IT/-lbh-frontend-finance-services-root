# API Integration to Common

When adding a new Api to the platform the best place is to have it in is
`mtfh-frontend-common`, so that it can be made available for all MFEs. We follow the
Swagger documentation and version when creating the utilities.

## API utility methods

There are many examples of existing API integrations in common, the patterns we have
implemented should be maintained to ensure consistency across the ecosystem.

### Requirements

- We initially only support the current version of the Api, and then maintain new versions
  until the older versions are safe to deprecate & remove.
- All GET request Api endpoints should leverage `useAxiosSWR` or `useAxiosInfiniteSWR`.
- Each Api version should have a separate webpack entry point, defined in the
  `webpack.config.js`.
- The custom instance of `axios` via `http` should be used, as it abstracts authentication
  and Etag logic.

## Test utilities

Once the Api utilities and type definitions are available in common the next thing to do
is to create the test utilities to accompany the Api utilities, this can be found in
`mtfh-frontend/packages/test-utils`.

### Requirements

- Follow the existing structure when defining mock data using `faker.js`.
- Create handlers for `msw` for each Api utility.
- Create a changeset and publish changes to npm.

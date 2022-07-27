# `mtfh-root-config`

This is the root-config app part of the Single SPA Framework Architecture. It was
generated using `create-single-spa` utility and adapted to include a common header and
footer. The header and the footer make use of the Hackney Design System. This app is the
host for all other microfrontends under the MTFH programme.

## Project Documentation

There is a collection of documents that outline some high level concepts that we have
implemented across the ecosystem. See
[documentation](https://github.com/LBHackney-IT/mtfh-finance-frontend-root/tree/main/docs).

The hope is that this documentation gets added to the
[micro-frontend playbook](https://lbhackney-it.github.io/micro-frontends/).

## Running it locally

To allow the Google authentication to work locally, you need to alias
`http://local.hackney.gov.uk/` to 127.0.0.1 in your local hosts file. This allows the
Google authentication token to be accepted as you're on a subdomain of `hackney.gov.uk`.

- Install all dependencies by running `yarn`.
- Run the root application with `yarn start`.
- Load `http://local.hackney.gov.uk:9000` in your browser.

### Loading applications inside the root application locally

Each application that has been configured to run inside the Single SPA framework.

See the README of each application for specific details on setup.

To load an application into this root application you need to run this root app with
`yarn start` and run the application(s) you want to load. With everything running you
should be able to just navigate to the route for a specific application to view it.

The recommended approach is to utilise the `@hackney/mtfh-cli` to install and run
micro-frontends.

### Adding a new micro-frontend using @hackney/mtfh-cli

1. Run `mtfh-cli new mtfh-frontend-{name}`
2. Follow instructions to complete the boilerplate.
3. In Root Config, add the template literal for the new app in `webpack.config.js`. e.g.
   `{APP_NAME}_APP_URL`
4. In Root Config, add the import map and define the route in `src/index.ejs`.
5. Update `.circleci/config.yml` to expose parameter to environment variable in build
   steps.

### Alternatives to creating a micro-frontend

For whatever reason, if the cli does not fit the needs of your application, you can use
the [create-single-spa](https://single-spa.js.org/docs/create-single-spa/) generator
manually. You will need to mirror a lot of the functionality that exists in the existing
micro-frontends.

## Global Dependencies

Global dependencies are defined in the inline import maps in `src/index.ejs` template.
These dependencies should either be in `umd` or `systemjs` format for cross micro-frontend
imports.

Not all libraries have umd support through cdns but they should support esm themselves.
For these particular cases we build a systemjs variant ourselves, see `webpack.config.js`.

Global dependencies we support:

1. react - CDN
2. react-dom - CDN
3. formik - bundled via webpack
4. yup - bundled via webpack
5. date-fns (partially bundled) - See `src/modules/date-fns`

These libraries can be safely added to a micro-frontend's `externals` in the
`webpack.config.js`. `react`, `react-dom`, and `@mtfh/*` libraries are automatically added
to externals.

## Production build

- You can create a production build by running `yarn build`.

### Testing

- You can run the unit tests by running `yarn test`.

### Resources

- [Hackney Design System](https://design-system.hackney.gov.uk/)
- [Single SPA Framework](https://single-spa.js.org/)
- [Typescript](https://www.typescriptlang.org/)
- [Webpack](https://webpack.js.org/)
- [EJS Templating](https://ejs.co/)

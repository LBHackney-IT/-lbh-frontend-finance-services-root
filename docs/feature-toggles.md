# Feature Toggles

The configuration api provides an endpoint for collecting feature toggles defined in the
github repo
[configuration-api-files](https://github.com/LBHackney-IT/configuration-api-files).

We primarily use Feature Toggles as a release mechanism to support continous delivery as
well as timed releases.

## Adding a new feature toggle

To add a new feature toogle, create a PR in the `configuration-api-files` in the main file
that relates to your project/team, in each environment directory.

NB: As a general rule of thumb, its good to enable to feature toggle for `development`
intially, whil having it off for the others until you need to toggle.

## Using a feature toggle

In react, we provide a hook to access feature toggles within React components:

```tsx
import { useFeatureToggle } from "@mtfh/common/lib/hooks";

const View = () => {
  const hasEditTenure = useFeatureToggle("MMH.EditTenure");
};
```

This automatically registers a subscriber and will update when changes are made.

Outside of React:

```tsx
import { hasToggle } from "@mtfh/common/lib/configuration";

const hasEditTenure = hasToggle("MMH.EditTenure");
```

You will need to manually subscibe to the `$configuration` behvaiour subject to listen to
changes.

## Released Deployments

Our micro-frontends are setup for continous delivery through trunk based git flow, and as
a result all unreleased features that introduce change should be feature toggled. This is
so developers can continously work on features and still allow hot fixes.

A helpful strategy to reduce complexity and avoid deeply nested feature toggles, we
recommend duplicating the top level views and marking the current version as legacy.

```
mtfh-frontend-tenure
├── node_modules
├── src
│   ├── components
│   └── views
│		├── edit-tenure-legacy
│		└── edit-tenure
└── app.tsx
```

In app.tsx:

```tsx
import { useFeatureToggle } from "@mtfh/common/lib/hooks";
import { EditTenureViewV2, EditTenureView } from "./views";

export default function App(): JSX.Element {
  const hasEditTenureV2 = useFeatureToggle("MMH.EditTenureV2");

  return (
    <Switch>
      <Route path="/tenure/:tenureId/edit">
        {hasEditTenureV2 ? <EditTenureView /> : <EditTenureViewLegacy />}
      </Route>
    </Switch>
  );
}
```

This is useful if the underlying change is quite complex.

For simple small changes, doing it inline is fine as long as its clear on which variant
needs to be removed after the feature toggles are deprecated. Naming variables with
`legacy` or leaving a comment is useful here in the case a collegue has to pick up this
task.

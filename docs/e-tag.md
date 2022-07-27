# E-tag implementation

Most backend Patch endpoints will have `If-Match` headers implemented. Meaning requests to
the endpoint that do not contain the correct header value will be rejected with a `409`
error.

## Axios

In `mtfh-frontend-common` we have a custom `axios` instance, that will inspect all `GET`
requests. If the payload contains an `id` field, we append the E-tag header value into the
request's payload, with the key `etag`.

See E-tag implementation
[here](https://github.com/LBHackney-IT/mtfh-frontend-common/blob/main/lib/http/http.ts#L37).

Similarily, the `axios` instance will append the `If-Match` header on any `PATCH` request
if there is an `etag` field in the payload.

See If-Match implementation
[here](https://github.com/LBHackney-IT/mtfh-frontend-common/blob/main/lib/http/http.ts#L27)

## Handling Errors

It's important to handle the 409 errors explicitly, as there is usually more information
we need to present to the user.

A minimal example is shown below to demonstrate a basic implementation:

```tsx
import React, { useState } from "React";
import { useParams } from "react-router-dom";

import { Formik } from "formik";

import { editPerson, Person } from "@mtfh/common/lib/api/person/v1";
import { ConflictErrorSummary } from "@mtfh/common/lib/components";
import { isAxiosError } from "@mtfh/common/lib/http";
import { entityDiff } from "@mtfh/common/lib/utils";

import { locale } from "../../services";

const EditPersonView = () => {
  const { id } = useParams<{ id: string }>();
  const { data: person, error } = usePerson(id);
  const [updatedFields, setUpdatedFields] = useState<Partial<Person>>();
  const [globalError, setGlobalError] = useState<number>();

  if (!person && !error) {
    return <div>Loading</div>;
  }

  if (error) {
    return <div>Error</div>;
  }

  // At this point we are guaranteed to have a person entity loaded
  // person = {
  //     id: '5211bf4e-9dab-4468-a760-2560b1cef71e'
  //     firstName: 'John',
  //     lastName: 'Smith',
  //     ...
  //     etag: '"3"'
  // }

  if (globalError === 409) {
    return (
      <ConflictErrorSummary
        id="person-conflict-error"
        updatedFields={updatedFields}
        fieldLocale={locale.personForm}
      />
    );
  }

  return (
    <Formik
      onSubmit={async (values) => {
        try {
          // We don't want the diff to contain the etag so we deconstruct here
          const { etag, ...data } = person;
          // Get the updated fields
          const diff = entityDiff<Person>(data, values);

          setUpdatedFields(diff);

          // Attempt a patch request and the etag value will be added to If-Match headers
          await editPerson({
            ...diff,
            etag,
          });
        } catch (e: unknown) {
          if (isAxiosError(e)) {
            setGlobalError(e.response.status);
          }
        }
      }}
    >
      ...
    </Formik>
  );
};
```

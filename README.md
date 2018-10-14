# react-searchable
[![CircleCI](https://circleci.com/gh/prograsdk/react-searchable.svg?style=svg&circle-token=6f7f2fec7ee257f7fb0455c3d3c28a310cdeb55d)](https://circleci.com/gh/prograsdk/react-searchable)
[![codecov](https://codecov.io/gh/prograsdk/react-searchable/branch/master/graph/badge.svg)](https://codecov.io/gh/prograsdk/react-searchable)

> Simple collection search for React based on the function-as-child/render props pattern.

## Installation
Add `react-searchable` to your dependencies using your favorite package manager. With Yarn:

```
yarn add react-searchable
```

or using npm:

```
npm install react-searchable
```

## Usage

### `<Searchable />`
`react-searchable` exports a single React component as its default export.

#### Props
 * `items: Array<T>`: An array of items of type `T` to be searched.
 * `predicate: (item: T, query: string) => Boolean`: A boolean function determining wether `item` should be included in the searched list based on the current `query` string.
 * `children | render: ({ items: Array<T>, query: string, handleChange: Function }) => ReactNode`: A render function for handling the search results.
 * `debounce?: int | boolean`: The amount in milliseconds to debounce the filtering function. `false` disables debounce and `true` uses the default. Defaults to `300`.
 * `initialQuery?: string`: A query string used for the initial search. Default to the empty string.


### Example
```javascript
import React from 'react';
import Searchable from 'react-searchable';

const predicate = (user, query) =>
  user.email.includes(query) || user.name.includes(query)

const UserList = ({ users }) => (
  <Searchable items={users} predicate={predicate}>
    {({ items, query, handleChange }) => (
      <>
        <input type="text" onChange={handleChange} value={query} />

        {items.length > 0 && (
          <ul>
            {items.map(({ id, name, email }) =>
              <li key={id}>{name} ({email})</li>
            )}
          </ul>
        )}
      </>
    )}
  </Searchable>
);
```
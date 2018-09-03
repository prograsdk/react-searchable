# react-searchable
[![CircleCI](https://circleci.com/gh/prograsdk/react-searchable.svg?style=svg&circle-token=6f7f2fec7ee257f7fb0455c3d3c28a310cdeb55d)](https://circleci.com/gh/prograsdk/react-searchable)
[![codecov](https://codecov.io/gh/prograsdk/react-searchable/branch/master/graph/badge.svg)](https://codecov.io/gh/prograsdk/react-searchable)

> Simple collection search for React basd on the function-as-child pattern

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
`react-searchable` exposes a single component as its default export. This component requires two props to function: `items` and `predicate`. `items` is a collection of items that should be searched through and `predicate` is a function used to filter these items.
`react-searchable` is based on the function-as-child (or [render-props](https://reactjs.org/docs/render-props.html)) pattern and therefore accepts a single funtion as its child. This function is called with an object of shape `{ items, handleChange, value }` as parameter. Here, `items` is an array of filtered items based on the `predicate` prop. `handleChange` is an event handler to be placed on an input element.

```javascript
import React from 'react';
import Searchable from 'react-searchable';

const predicate = (item, value) => item.includes(value);

const EmailList = ({ emails }) => (
  <Searchable items={emails} predicate={predicate}>
    {({ items, value, handleChange }) => (
      <>
        <input type="text" placeholder="Search ..." onChange={handleChange} />

        {items.length > 0 && (
          <ul>
            {items.map(item => <li key={item}>{item}</li>)}
          </ul>
        )}
      </>
    )}
  </Searchable>
);
```

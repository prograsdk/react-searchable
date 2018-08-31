# react-searchable

> Simple collection search for React basd on the function-as-child pattern

## Installation
Add `react-searchable` to your dependencies using your favorite package manager. Using Yarn: `yarn add react-searchable` or using npm: `npm install --save react-searchable`.

## Usage
`react-searchable` exposes a single component as its default export. This component needs to props to function: `items` and `predicate`. `items` is the collection of items that should be searched and `predicate` is a function used to filter these items.
`react-searchable` is based on the function-as-child or render-props pattern and therefore accepts a single funtion as child. This function is called with an object of shape `{ items, handleChange, value }` as parameter. Here, `items` is an array of filtered items based on the `predicate` prop. `handleChange` is an event handler to be placed on an input element.

```javascript
import React from 'react';
import Searchable from 'react-searchable'

const EmailList = ({ emails }) => (
  <Searchable items={emails} predicate={predicate}>
    {({ items, value, handleChange }) => (
      <>
        <input type="text" placeholder="Search ..." onChange={handleChange} />
        
        {items.map(item => <p>{item}</p>)}
      </>
    )}
  </Searchable>
)
```

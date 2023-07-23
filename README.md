# React Pick Time Range Slot (react-pick-time-range)

[![NPM version][npm-image]][npm-url]
[![Build][github-build]][github-build-url]
![npm-typescript]
[![License][github-license]][github-license-url]

Simple & customized time slots picker for React

[**Live Demo**](https://gogosoon.github.io/react-pick-time-range/)

## Installation:

```bash
npm install react-pick-time-range
```

or

```bash
yarn add react-pick-time-range
```

Add the following bootstrap code in `index.js` or `index.ts` of your project. The UI will look ugly if not added. 

```javascript
import 'bootstrap/dist/css/bootstrap.css'
```

## Usage :

Add `PickTime` to your component:

```js
import React from 'react'
import ReactDOM from 'react-dom/client'
import { PickTime } from 'react-pick-time-range'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
    <React.StrictMode>
        <div>
            <h2>Time Range Picker Demo</h2>
            <PickTime
              onError={(error, timings) => {
                console.log('On Error', error, timings)
              }}
              onSave={(timings) => {
                console.log('Data', timings)
              }}
              onSlotsFilled={() => {
                alert('All slots are filled')
              }}
              scheduledTimings={[
                ['01:00', '01:30'],
                ['17:30', '18:00'],
              ]}
              timeFrame={30}
            />
        </div>
    </React.StrictMode>,
)

```

[npm-url]: https://www.npmjs.com/package/react-pick-time-range
[npm-image]: https://img.shields.io/npm/v/react-pick-time-range
[github-license]: https://img.shields.io/github/license/gogosoon/react-pick-time-range
[github-license-url]: https://github.com/gogosoon/react-pick-time-range/blob/master/LICENSE
[github-build]: https://github.com/gogosoon/react-pick-time-range/actions/workflows/publish.yml/badge.svg
[github-build-url]: https://github.com/gogosoon/react-pick-time-range/actions/workflows/publish.yml
[npm-typescript]: https://img.shields.io/npm/types/react-pick-time-range

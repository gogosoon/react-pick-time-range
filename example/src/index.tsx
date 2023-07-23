import React from 'react'
import ReactDOM from 'react-dom/client'
import { PickTime } from 'react-pick-time-range'
import 'bootstrap/dist/css/bootstrap.css'

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
          ['00:00', '00:30'],
          ['17:00', '18:00'],
        ]}
        timeFrame={30}
      />
    </div>
    <hr />
  </React.StrictMode>,
)

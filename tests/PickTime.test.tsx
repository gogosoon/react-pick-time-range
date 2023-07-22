import * as React from 'react'
import { render } from '@testing-library/react'

import 'jest-canvas-mock'

import { PickTime } from '../src'

describe('PickTime render', () => {
  it('Renders without crashing', () => {
    render(
      <PickTime onError={() => {}} onSave={() => {}} onSlotsFilled={() => {}} scheduledTimings={[]} timeFrame={60} />,
    )
  })
})

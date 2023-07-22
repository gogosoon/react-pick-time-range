import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useState } from 'react'
import { Button } from './Button'
import { HourInMinutes, TimeFrames } from '../config/Constants'
import { formatTime } from '../utils/utils'

export const printHourStrings = (h) => (h > 9 ? `${h}:00` : `0${h}:00`)

interface Props {
  onSave: (data: FromToTiming[]) => void
  scheduledTimings: Timings[]
  onError: (error: string, timing: Timings) => void
  timeFrame: TimeFrames
  timeFormat?: TimeFormat
  onSlotsFilled: () => void
}

export type Timings = [string, string]
export type TimingPair = [number, number]
export type FromToTiming = { from: string; to: string }
export type TimeFormat = 12 | 24

export function PickTime(props: Props) {
  const [scheduledTimings, setScheduledTimings] = useState<TimingPair[]>([])
  const [startTimes, setStartTimes] = useState<number[]>()
  const [endTimes, setEndTimes] = useState<number[]>()

  const { MAP_TIME_TO_SLOT_ID, timeSlots, TIMESLOT_MAP } = findTimeSlotsInfo(props.timeFrame)

  function findTimeSlotsInfo(timeFrame: TimeFrames) {
    const minuteSplitForEveryHour = timeFrame / HourInMinutes
    const minuteSplitCount = Math.floor(1 / minuteSplitForEveryHour)
    const timeSlots = []
    const TIMESLOT_MAP = {}
    const MAP_TIME_TO_SLOT_ID = {}
    for (let i = 0; i < 24; i++) {
      const slot = `${String(i).padStart(2, '0')}:00`
      timeSlots.push(i)
      TIMESLOT_MAP[i] = slot
      MAP_TIME_TO_SLOT_ID[slot] = i
      for (let j = 0; j < minuteSplitCount - 1; j++) {
        const minuteSplit = i + (j + 1) * minuteSplitForEveryHour
        const minuteSlot = `${String(i).padStart(2, '0')}:${String((j + 1) * props.timeFrame).padStart(2, '0')}`
        timeSlots.push(minuteSplit)
        TIMESLOT_MAP[minuteSplit] = minuteSlot
        MAP_TIME_TO_SLOT_ID[minuteSlot] = minuteSplit
      }
    }
    timeSlots.push(24)
    TIMESLOT_MAP[24] = '00:00'
    MAP_TIME_TO_SLOT_ID['00:00'] = 24
    return { timeSlots, TIMESLOT_MAP, MAP_TIME_TO_SLOT_ID }
  }

  useEffect(() => {
    if (scheduledTimings.length === 0) {
      setStartTimes([...timeSlots])
      setEndTimes([...timeSlots])
    }
  }, [scheduledTimings])

  useEffect(() => {
    if (props?.scheduledTimings) {
      const newTimings: TimingPair[] = []
      for (const timing of props.scheduledTimings) {
        const startTimeId: number = MAP_TIME_TO_SLOT_ID[timing[0]]
        const endTimeId: number = MAP_TIME_TO_SLOT_ID[timing[1]]
        if (!startTimeId || !endTimeId) {
          props?.onError('Invalid timings provided', timing)
          break
        }
        newTimings.push([startTimeId, endTimeId])
      }
      setScheduledTimings(newTimings)
    }
  }, [props.scheduledTimings])

  const changeStartTime = (event, index) => {
    const previousScheduledTimings = [...scheduledTimings]
    const timingPair = previousScheduledTimings[index]
    timingPair[0] = parseFloat(event.target.value)
    const timingPairBeginIndex = timeSlots.indexOf(timingPair[0])
    if (timingPair[1] <= timingPair[0]) {
      timingPair[1] = timeSlots[timingPairBeginIndex + 1]
    } else {
      const nextMinimumTime = getNextImmediateScheduledTimeIndex(timingPair[0])
      if (nextMinimumTime < timingPair[1]) {
        if (nextMinimumTime !== -1) {
          timingPair[1] = nextMinimumTime
        }
      }
    }
    previousScheduledTimings[index] = timingPair
    setScheduledTimings(previousScheduledTimings)
  }

  const changeEndTime = (event, index) => {
    const previousScheduledTimings = [...scheduledTimings]
    const timingPair = previousScheduledTimings[index]
    timingPair[1] = parseFloat(event.target.value)
    setScheduledTimings(previousScheduledTimings)
  }

  const handleRemoveClick = (index: number) => {
    const previousScheduledTimings = [...scheduledTimings]
    previousScheduledTimings.splice(index, 1)
    setScheduledTimings(previousScheduledTimings)
  }

  const handleAddClick = () => {
    const firstMinimumTime = getFirstMinimumTime()
    if (firstMinimumTime === -1) {
      props.onSlotsFilled()
      return
    }
    const secondMinimumTime = getSecondMinimumTime(firstMinimumTime)
    if (secondMinimumTime === -1) {
      props.onSlotsFilled()
      return
    }
    setScheduledTimings([...scheduledTimings, [firstMinimumTime, secondMinimumTime]])
  }

  function getFirstMinimumTime() {
    if (scheduledTimings.length === 0) {
      return 0
    }
    return getFirstTime()
  }

  function getFirstTime() {
    const timings = [...timeSlots]
    const blockedSlots = getAllBlockedTimeSlots()
    for (let i = 0; i < timings.length; i++) {
      if (!blockedSlots.includes(timings[i])) {
        return timings[i]
      }
    }
    return -1
  }

  function getSecondTime(firstMinimumTime: number) {
    const blockedSlots = getAllBlockedTimeSlots()
    for (let i = timeSlots.indexOf(firstMinimumTime) + 1; i < timeSlots.length; i++) {
      if (!(blockedSlots.includes(timeSlots[i]) && blockedSlots.includes[timeSlots[i + 1]])) {
        return timeSlots[i]
      }
    }
    return -1
  }

  function getSecondMinimumTime(firstMinimumTime) {
    if (scheduledTimings.length === 0) {
      return timeSlots[1]
    }
    return getSecondTime(firstMinimumTime)
  }

  const save = () => {
    const scheduledTimingsInTimeFormat = getScheduledTimingsInUTCTimeFormat()
    console.log('Original Scheduled Time Slots', scheduledTimings)
    props.onSave(scheduledTimingsInTimeFormat)
  }

  function getScheduledTimingsInUTCTimeFormat() {
    const formattedScheduledTimings: FromToTiming[] = []
    for (let i = 0; i < scheduledTimings.length; i++) {
      const timingPair = scheduledTimings[i]
      const from = TIMESLOT_MAP[timingPair[0]]
      const to = TIMESLOT_MAP[timingPair[1]]
      formattedScheduledTimings.push({
        from: from,
        to: to,
      })
    }
    return formattedScheduledTimings
  }

  function isStartDisabled(currentTime: number, scheduledTimingsPair: TimingPair): boolean {
    if (currentTime === 24) {
      return true
    }

    if (currentTime === scheduledTimingsPair[0]) {
      return false
    }

    if (currentTime > scheduledTimingsPair[0] && currentTime < scheduledTimingsPair[1]) {
      return false
    }

    const allBlockedTimeSlots = getAllBlockedTimeSlots()

    return allBlockedTimeSlots.includes(currentTime)
  }

  function getAllBlockedTimeSlots() {
    const timings = [...timeSlots]
    let filledTimeSlots = []
    for (let i = 0; i < scheduledTimings.length; i++) {
      const timingPair = scheduledTimings[i]
      const beginIndex = timings.indexOf(timingPair[0])
      const endIndex = timings.indexOf(timingPair[1])

      const splittedArray = timings.slice(beginIndex, endIndex)
      filledTimeSlots = filledTimeSlots.concat(splittedArray)
    }
    return filledTimeSlots
  }

  function isEndDisabled(currentTime: number, scheduledTimingsPair: TimingPair) {
    if (currentTime <= scheduledTimingsPair[0]) {
      return true
    }

    const currentPairBegining = scheduledTimingsPair[0]
    const beginingTimes = getAllBeginingTimes()

    beginingTimes.sort(function (a, b) {
      return a - b
    })

    const nextPairBeginingIndex = beginingTimes.indexOf(currentPairBegining) + 1

    if (currentTime <= beginingTimes[nextPairBeginingIndex]) {
      return false
    }

    if (!beginingTimes[nextPairBeginingIndex]) {
      return false
    }

    return true
  }

  function getAllBeginingTimes() {
    const beginingTimes = []
    for (let i = 0; i < scheduledTimings.length; i++) {
      const timingPair = scheduledTimings[i]
      beginingTimes.push(timingPair[0])
    }
    return beginingTimes
  }

  function getNextImmediateScheduledTimeIndex(currentTime: number) {
    let nextImmediateTime = null
    for (let i = 0; i < scheduledTimings.length; i++) {
      const timingPair = scheduledTimings[i]
      if (!nextImmediateTime) {
        if (timingPair[0] > currentTime) {
          nextImmediateTime = timingPair[0]
        }
      } else {
        if (timingPair[0] > currentTime && timingPair[0] < nextImmediateTime) {
          nextImmediateTime = timingPair[0]
        }
      }
    }
    if (nextImmediateTime) return nextImmediateTime
    else return -1
  }

  return (
    <>
      <>
        <div className='row form-row hours-cont'>
          <div className='col-3 col-md-3'>
            {scheduledTimings.map((timingPair, index) => {
              return (
                <div className='row form-row' key={index}>
                  <div className='col-4'>
                    <div className='form-group'>
                      <label>Start Time</label>
                      <select
                        className='form-control'
                        onChange={(e) => changeStartTime(e, index)}
                        data-idx={index}
                        name='start'
                        value={timingPair[0]}
                      >
                        {startTimes.map((time, startTimeIndex) => {
                          const isDisabled = isStartDisabled(time, scheduledTimings[index])
                          return (
                            <option key={`start-${startTimeIndex}`} disabled={isDisabled} value={time}>
                              {formatTime(TIMESLOT_MAP[time], props.timeFormat && props?.timeFormat == 12)}
                            </option>
                          )
                        })}
                      </select>
                    </div>
                  </div>
                  <div className='col-4'>
                    <div className='form-group'>
                      <label>End Time</label>
                      <select
                        className='form-control'
                        onChange={(e) => changeEndTime(e, index)}
                        data-idx={index}
                        value={timingPair[1]}
                        name='end'
                      >
                        {endTimes.map((time, endTimeIndex) => {
                          const isDisabled = isEndDisabled(time, scheduledTimings[index])
                          return (
                            <option key={`end-${endTimeIndex}`} disabled={isDisabled} value={time}>
                              {formatTime(TIMESLOT_MAP[time], props.timeFormat && props?.timeFormat == 12)}
                            </option>
                          )
                        })}
                      </select>
                    </div>
                  </div>
                  <div className='col-12 col-md-2'>
                    <div className='col-12 col-md-2 col-lg-1'>
                      <label className='d-md-block d-sm-none d-none'>&nbsp;</label>
                      <Button
                        name=''
                        onClick={() => {
                          handleRemoveClick(index)
                        }}
                        className='btn btn-outline-danger trash'
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </>

      <div
        style={{
          display: 'flex',
          gap: 10,
          marginTop: 10,
        }}
      >
        <Button onClick={handleAddClick} name='+ Add More' className='btn-outline-primary' />
        <Button
          onClick={save}
          type='submit'
          name='Save Changes'
          className='btn btn-primary submit-btn'
          data-dismiss='modal'
        />
      </div>
    </>
  )
}

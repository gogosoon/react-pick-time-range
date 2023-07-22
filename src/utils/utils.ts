import moment from 'moment'

export const formatTime = (time: string, twelveHour: boolean = true) => {
  return twelveHour ? moment(time, 'HH:mm').format('hh:mm A') : time
}

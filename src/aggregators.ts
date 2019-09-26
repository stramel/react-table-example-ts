// This is a custom aggregator that
// takes in an array of values and
// returns the rounded median
export function roundedMedian(values: number[]) {
  let min = values[0] || 0
  let max = values[0] || 0

  values.forEach(value => {
    min = Math.min(min, value)
    max = Math.max(max, value)
  })

  return Math.round((min + max) / 2)
}

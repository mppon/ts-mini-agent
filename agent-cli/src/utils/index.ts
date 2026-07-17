export function formatUsage(usage: number) {
  if (usage < 1000) {
    return `${usage}`
  }
  else {
    const _usage = (usage / 1000).toFixed(2)
    return `${_usage}k`
  }
}

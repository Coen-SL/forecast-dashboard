export const variance = (actual, budget) => {
  if (!budget) return 0
  return (actual - budget) / Math.abs(budget)
}

export const trafficLight = (metric, score) => {
  const positiveIsGood = metric !== 'covers' ? true : true
  const effective = positiveIsGood ? score : -score

  if (effective >= 0.03) return { label: 'Green', color: 'var(--green)' }
  if (effective >= -0.03) return { label: 'Orange', color: 'var(--orange)' }
  return { label: 'Red', color: 'var(--red)' }
}

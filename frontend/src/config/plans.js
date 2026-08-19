export const PLANS = [
  { id: 'basic', labelKey: 'createVideo.planBasic', minDuration: 3, maxDuration: 12 },
  { id: 'plan2', labelKey: 'createVideo.planPlan2', minDuration: 12, maxDuration: 20 },
]

export function getPlan(planId) {
  return PLANS.find((p) => p.id === planId) ?? PLANS[0]
}

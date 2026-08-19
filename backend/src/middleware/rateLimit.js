import rateLimit from 'express-rate-limit'

// Limit jeneral pou tout /api — pwoteje kont abi debaz.
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
})

// Pi strik pou login/register — evite yon moun eseye devine modpas anpil fwa.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Twòp esè konekte/enskri — tanpri eseye ankò nan 15 minit.' },
})

// Espesyal pou operasyon ki koute lajan (script + video generation).
// Yon sèl itilizatè pa dwe ka epwize bidjè API a poukont li.
export const generationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => String(req.userId),
  message: { error: 'Ou rive nan limit jenerasyon pou èdtan sa a — eseye ankò pita.' },
})

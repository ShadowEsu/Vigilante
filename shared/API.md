# Shared types mirrored from web `src/types/database.ts`
# Used as reference for Kotlin (android/) and Swift (ios/) model parity.

TARGET_TYPES = company | person | ticker
ANALYSIS_STATUS = live | paused
SIGNAL_SEVERITY = low | med | high
SIGNAL_TYPES = pricing | promo | hiring | site | market | expansion | person

MOBILE_DEEP_LINK = vigil://auth/callback
API_RUN_ENDPOINT = POST /api/analyses/{id}/run
API_AUTH = Bearer {supabase_access_token}

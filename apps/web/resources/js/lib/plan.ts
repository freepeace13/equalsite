/**
 * Whether the current visitor should see Pro-tier UI (unlocked crawl depth,
 * no upgrade prompts). True either because they're actually on the Pro
 * plan, or because monetization is globally disabled and every scan runs
 * unrestricted regardless of the stored plan — see PlanLimits::for().
 */
export function resolveIsPro(
    user: { plan?: string } | null | undefined,
    monetizationEnabled: boolean,
): boolean {
    return !monetizationEnabled || user?.plan === 'pro';
}

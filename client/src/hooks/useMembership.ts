/**
 * Membership hook — thin re-export of the MembershipContext provider.
 *
 * Returns tier, allowance, nextGrantAt, isFree, isSpark, isSparkPro, hasTier(), refresh().
 * See contexts/MembershipContext.tsx for the full implementation.
 */
export { useMembership } from "../contexts/MembershipContext";

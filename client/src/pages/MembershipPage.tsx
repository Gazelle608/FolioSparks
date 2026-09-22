import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useauth';
import { useMembership } from '../hooks/usemembership';
import { useSparks } from '../hooks/usesparks';
import { PageWrapper } from '../components/layout';
import { PricingTiers, SparksAllowanceDisplay } from '../components/membership';
import { SparkFilledIcon } from '../assets/icons';

export function MembershipPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tier, allowance, nextGrantAt } = useMembership();
  const { balance } = useSparks();

  return (
    <PageWrapper size="lg">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-spark/15 mb-4">
          <SparkFilledIcon size={12} className="text-spark-dark" />
          <span className="text-xs font-semibold text-primary-900 uppercase tracking-wider">
            Membership
          </span>
        </div>
        <h1 className="font-display text-3xl lg:text-4xl font-bold text-primary-900">
          Sparks that fund the writers
        </h1>
        <p className="mt-3 text-primary-500">
          Every tier tops up your Sparks allowance. Sparks go to specific
          chapters — the exact moments that hit hardest.
        </p>
      </div>

      {/* Current balance widget (only for signed-in users) */}
      {user && (
        <div className="max-w-md mx-auto mb-10">
          <SparksAllowanceDisplay
            variant="expanded"
            balance={balance}
            allowance={allowance}
            tier={tier}
            nextGrantAt={nextGrantAt}
          />
        </div>
      )}

      <PricingTiers
        currentTier={user ? tier : null}
        isSignedIn={!!user}
        onTierSelected={() => navigate('/signup')}
      />

      <div className="mt-12 rounded-lg border border-primary-100 bg-white p-6">
        <h3 className="font-display text-base font-bold text-primary-900 mb-2">
          What about donations?
        </h3>
        <p className="text-sm text-primary-600 leading-relaxed">
          Every author you love has a direct donation link (Ko-fi, Patreon,
          Buy Me a Coffee, or any URL they choose). FolioSparks takes{' '}
          <strong className="text-primary-900">0%</strong> of those — 100% goes
          straight to the writer. Your membership is separate: it tops up your
          Sparks and funds the reading experience, and the majority of it flows
          to authors based on how many Sparks their chapters earn.
        </p>
      </div>
    </PageWrapper>
  );
}

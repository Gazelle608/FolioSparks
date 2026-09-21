import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMembership } from '../hooks/useMembership';
import { Container } from '../components/layout';
import { Button, Card } from '../components/ui';
import { CheckCircleIcon, SparkFilledIcon, ArrowRightIcon } from '../assets/icons';

export function CheckoutSuccessPage() {
  const { tier, allowance, refresh } = useMembership();

  // Refresh membership state (webhook may still be in flight)
  useEffect(() => {
    refresh();
    // Try again after a delay
    const timer = setTimeout(() => refresh(), 3000);
    return () => clearTimeout(timer);
  }, [refresh]);

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center py-12 px-4">
      <Container size="sm">
        <Card className="p-8 sm:p-10 text-center">
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center">
              <CheckCircleIcon size={32} className="text-white" />
            </div>
          </div>

          <h1 className="font-display text-2xl font-bold text-primary-900">
            You're in
          </h1>
          <p className="mt-2 text-sm text-primary-500">
            {tier === 'spark_pro'
              ? 'Spark Pro is active.'
              : 'Spark is active.'}{' '}
            Your new allowance will land on the 1st.
          </p>

          <div className="mt-8 rounded-lg bg-spark/10 border border-spark/30 p-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <SparkFilledIcon size={16} className="text-spark-dark" />
              <span className="font-display text-2xl font-bold text-primary-900 tabular-nums">
                {allowance.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-primary-600">
              Sparks a month on this plan
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/library">
              <Button variant="primary" size="lg" rightIcon={<ArrowRightIcon size={16} />}>
                Start reading
              </Button>
            </Link>
            <Link to="/membership">
              <Button variant="secondary" size="lg">
                Manage membership
              </Button>
            </Link>
          </div>
        </Card>
      </Container>
    </div>
  );
}

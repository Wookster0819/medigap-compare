import { useGetPlansSummary, getGetPlansSummaryQueryKey } from '@workspace/api-client-react';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, TrendingDown, Layers, Shield } from 'lucide-react';

interface SummaryBarProps {
  zip: string;
  age: number;
  married?: boolean;
}

export function SummaryBar({ zip, age, married }: SummaryBarProps) {
  const { data: summary, isLoading } = useGetPlansSummary(
    { zip, age, married },
    { query: { enabled: !!zip, queryKey: getGetPlansSummaryQueryKey({ zip, age, married }) } }
  );

  if (isLoading) {
    return (
      <div className="bg-card border rounded-xl p-6 shadow-sm mb-8">
        <Skeleton className="h-6 w-1/4 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="bg-primary text-primary-foreground rounded-xl p-6 shadow-md mb-8" data-testid="summary-bar">
      <div className="flex items-center gap-2 mb-6 opacity-90">
        <MapPin className="h-5 w-5" />
        <h2 className="text-lg font-medium">
          Plans available in {summary.county}, {summary.state}
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary-foreground/70 text-sm font-medium">
            <Layers className="h-4 w-4" />
            Total Plans
          </div>
          <div className="text-3xl font-serif" data-testid="text-total-plans">{summary.totalPlans}</div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary-foreground/70 text-sm font-medium">
            <TrendingDown className="h-4 w-4" />
            Lowest Premium
          </div>
          <div className="text-3xl font-serif" data-testid="text-lowest-premium">${summary.lowestPremium}<span className="text-lg text-primary-foreground/60 font-sans">/mo</span></div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary-foreground/70 text-sm font-medium">
            <TrendingDown className="h-4 w-4" />
            Median Premium
          </div>
          <div className="text-3xl font-serif" data-testid="text-median-premium">${summary.medianPremium}<span className="text-lg text-primary-foreground/60 font-sans">/mo</span></div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary-foreground/70 text-sm font-medium">
            <Shield className="h-4 w-4" />
            Most Popular
          </div>
          <div className="text-3xl font-serif" data-testid="text-popular-plan">Plan {summary.popularPlanLetter}</div>
        </div>
      </div>
    </div>
  );
}

import { useGetPlansSummary, getGetPlansSummaryQueryKey } from '@workspace/api-client-react';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, TrendingDown, Layers, Shield, BarChart2 } from 'lucide-react';

interface SummaryBarProps {
  zip: string;
  age: number;
  householdEligible?: boolean;
  planLetter?: string; // 'all' or a specific letter
}

export function SummaryBar({ zip, age, householdEligible, planLetter }: SummaryBarProps) {
  const { data: summary, isLoading } = useGetPlansSummary(
    { zip, age, householdEligible },
    { query: { enabled: !!zip, queryKey: getGetPlansSummaryQueryKey({ zip, age, householdEligible }) } }
  );

  if (isLoading) {
    return (
      <div className="bg-card border rounded-xl p-6 shadow-sm mb-8">
        <Skeleton className="h-6 w-1/4 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      </div>
    );
  }

  if (!summary) return null;

  // When a specific letter is selected, derive stats from byLetter
  const letterData = planLetter && planLetter !== 'all'
    ? summary.byLetter.find(l => l.letter === planLetter)
    : null;

  const isFiltered = !!letterData;

  const totalPlans   = isFiltered ? letterData!.count        : summary.totalPlans;
  const lowestPrem   = isFiltered ? letterData!.minPremium   : summary.lowestPremium;
  const medianPrem   = isFiltered ? letterData!.avgPremium   : summary.medianPremium;
  const fourthLabel  = isFiltered ? 'Highest'               : 'Most Popular';
  const fourthValue  = isFiltered
    ? `$${letterData!.maxPremium}/mo`
    : `Plan ${summary.popularPlanLetter}`;

  const location = `${summary.county}, ${summary.state}`;
  const heading = isFiltered
    ? `Plan ${planLetter} — ${location}`
    : `All plans — ${location}`;

  return (
    <div className="bg-primary text-primary-foreground rounded-xl p-6 shadow-md mb-8" data-testid="summary-bar">
      <div className="flex items-center gap-2 mb-6 opacity-90">
        <MapPin className="h-5 w-5" />
        <h2 className="text-lg font-medium">{heading}</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary-foreground/70 text-sm font-medium">
            <Layers className="h-4 w-4" />
            {isFiltered ? `Plan ${planLetter} options` : 'Total Plans'}
          </div>
          <div className="text-3xl font-serif" data-testid="text-total-plans">{totalPlans}</div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary-foreground/70 text-sm font-medium">
            <TrendingDown className="h-4 w-4" />
            Lowest Premium
          </div>
          <div className="text-3xl font-serif" data-testid="text-lowest-premium">
            ${lowestPrem}<span className="text-lg text-primary-foreground/60 font-sans">/mo</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary-foreground/70 text-sm font-medium">
            <BarChart2 className="h-4 w-4" />
            {isFiltered ? 'Avg Premium' : 'Median Premium'}
          </div>
          <div className="text-3xl font-serif" data-testid="text-median-premium">
            ${medianPrem}<span className="text-lg text-primary-foreground/60 font-sans">/mo</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary-foreground/70 text-sm font-medium">
            <Shield className="h-4 w-4" />
            {fourthLabel}
          </div>
          <div className="text-3xl font-serif" data-testid="text-popular-plan">
            {isFiltered
              ? <>{fourthValue.replace('/mo','')}<span className="text-lg text-primary-foreground/60 font-sans">/mo</span></>
              : fourthValue
            }
          </div>
        </div>
      </div>
    </div>
  );
}

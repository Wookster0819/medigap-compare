import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { useGetPlans, getGetPlansQueryKey, useGetPlansSummary, getGetPlansSummaryQueryKey } from '@workspace/api-client-react';
import { Header } from '@/components/Header';
import { SummaryBar } from '@/components/SummaryBar';
import { PlanCard } from '@/components/PlanCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchForm } from '@/components/SearchForm';
import { ArrowLeft, Inbox } from 'lucide-react';
import { Link } from 'wouter';

export default function Results() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const zip = searchParams.get('zip') || '';
  const age = parseInt(searchParams.get('age') || '65', 10);
  const householdEligible = searchParams.get('householdEligible') === 'true';

  const [planLetter, setPlanLetter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('premium_asc');

  // We use summary to get all available letters for the filter
  const { data: summary } = useGetPlansSummary(
    { zip, age, householdEligible },
    { query: { enabled: !!zip, queryKey: getGetPlansSummaryQueryKey({ zip, age, householdEligible }) } }
  );

  const apiPlanLetter = planLetter !== 'all' ? planLetter : undefined;

  const { data: plans, isLoading } = useGetPlans(
    { zip, age, householdEligible, planLetter: apiPlanLetter, sortBy },
    { query: { enabled: !!zip, queryKey: getGetPlansQueryKey({ zip, age, householdEligible, planLetter: apiPlanLetter, sortBy }) } }
  );

  // Fallback local sorting in case API doesn't handle all sort types
  const sortedPlans = useMemo(() => {
    if (!plans) return [];
    const sorted = [...plans];
    if (sortBy === 'premium_asc') {
      sorted.sort((a, b) => a.monthlyPremium - b.monthlyPremium);
    } else if (sortBy === 'premium_desc') {
      sorted.sort((a, b) => b.monthlyPremium - a.monthlyPremium);
    } else if (sortBy === 'insurer_name') {
      sorted.sort((a, b) => a.insurerName.localeCompare(b.insurerName));
    }
    return sorted;
  }, [plans, sortBy]);

  const availableLetters = summary?.byLetter.map(l => l.letter) || [];

  if (!zip) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-2xl font-serif">Please enter your details to compare plans.</h2>
            <SearchForm />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow bg-muted/20 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-6 flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-new-search">
              <ArrowLeft className="h-4 w-4" />
              New Search
            </Link>
          </div>

          <SummaryBar zip={zip} age={age} householdEligible={householdEligible} planLetter={planLetter} />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap items-center gap-2" data-testid="filter-plan-letters">
              <Button
                variant={planLetter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPlanLetter('all')}
                className="rounded-full"
                data-testid="button-filter-all"
              >
                All Plans
              </Button>
              {availableLetters.map(letter => (
                <Button
                  key={letter}
                  variant={planLetter === letter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPlanLetter(letter)}
                  className="rounded-full min-w-10"
                  data-testid={`button-filter-plan-${letter}`}
                >
                  Plan {letter}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Sort by</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-card" data-testid="select-sort">
                  <SelectValue placeholder="Sort plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="premium_asc">Lowest Premium</SelectItem>
                  <SelectItem value="premium_desc">Highest Premium</SelectItem>
                  <SelectItem value="insurer_name">Insurer Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <>
                <Skeleton className="h-[280px] w-full rounded-xl" />
                <Skeleton className="h-[280px] w-full rounded-xl" />
                <Skeleton className="h-[280px] w-full rounded-xl" />
              </>
            ) : sortedPlans.length > 0 ? (
              sortedPlans.map(plan => (
                <PlanCard key={plan.id} plan={plan} />
              ))
            ) : (
              <div className="bg-card border border-dashed rounded-xl p-12 text-center" data-testid="empty-state">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <Inbox className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-serif text-foreground mb-2">No plans found</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  We couldn't find any Medigap plans matching your current criteria in your area. 
                  Try clearing your filters or searching a different zip code.
                </p>
                <Button variant="outline" onClick={() => setPlanLetter('all')} data-testid="button-clear-filters">
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

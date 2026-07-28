import { useGetPlanLetters } from '@workspace/api-client-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, X } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function PlanLettersInfo() {
  const { data: letters, isLoading } = useGetPlanLetters();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-1/3" />
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  if (!letters || letters.length === 0) {
    return null;
  }

  return (
    <div className="space-y-10 mt-16 pb-16">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-3xl font-serif text-foreground">Understanding the Plan Letters</h2>
        <p className="text-lg text-muted-foreground">
          Medigap plans are standardized by the government. A Plan G from one company has the exact same coverage as a Plan G from another. The only difference is the price.
        </p>
      </div>

      <div className="max-w-3xl mx-auto bg-card border rounded-xl shadow-sm overflow-hidden">
        <Accordion type="single" collapsible className="w-full">
          {letters.map((plan) => (
            <AccordionItem key={plan.letter} value={plan.letter} className="border-b last:border-0 px-6">
              <AccordionTrigger className="hover:no-underline py-6 group" data-testid={`accordion-trigger-plan-${plan.letter}`}>
                <div className="flex flex-col sm:flex-row sm:items-center text-left gap-2 sm:gap-6 w-full pr-4">
                  <span className="text-2xl font-bold text-primary w-24">Plan {plan.letter}</span>
                  <div className="flex-1">
                    <span className="text-foreground font-medium block">{plan.headline}</span>
                  </div>
                  <span className="text-sm font-medium text-accent bg-accent/10 px-3 py-1 rounded-full whitespace-nowrap">
                    {plan.popularity}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6 pt-2">
                <p className="text-muted-foreground text-base mb-8 leading-relaxed max-w-2xl">
                  {plan.description}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 max-w-2xl bg-muted/30 p-5 rounded-lg border border-border/50">
                  <CoverageItem label="Part A Coinsurance" covered={plan.partACoinsurance} />
                  <CoverageItem label="Part B Coinsurance" covered={plan.partBCoinsurance} />
                  <CoverageItem label="Part A Deductible" covered={plan.partADeductible} />
                  <CoverageItem label="Part B Deductible" covered={plan.partBDeductible} />
                  <CoverageItem label="Skilled Nursing" covered={plan.skilledNursing} />
                  <CoverageItem label="Foreign Travel" covered={plan.foreignTravel} />
                  <CoverageItem label="Out of Pocket Limit" covered={plan.outOfPocketLimit} />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

function CoverageItem({ label, covered }: { label: string; covered: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-foreground/80">{label}</span>
      {covered ? (
        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground/30 shrink-0" />
      )}
    </div>
  );
}

import { MedigapPlan } from '@workspace/api-client-react';
import { ShieldCheck, Info, Check, HeartHandshake } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function PlanCard({ plan }: { plan: MedigapPlan }) {
  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200" data-testid={`card-plan-${plan.id}`}>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-foreground" data-testid={`text-insurer-${plan.id}`}>{plan.insurerName}</h3>
            {plan.amBestRating && (
              <span className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                AM Best: {plan.amBestRating}
              </span>
            )}
          </div>
          <div className="text-muted-foreground text-sm flex items-center gap-2">
            <span>{plan.yearsInBusiness} years in business</span>
            {plan.planType !== 'standard' && (
              <>
                <span>•</span>
                <span className="capitalize">{plan.planType}</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex flex-col md:items-end">
          <div className="text-3xl font-serif text-primary" data-testid={`text-premium-${plan.id}`}>
            ${plan.monthlyPremium}<span className="text-lg text-muted-foreground font-sans">/mo</span>
          </div>
          <div className="text-sm font-medium text-foreground mt-1">Plan {plan.planLetter}</div>
          {plan.marriedDiscount && (
            <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full" data-testid={`badge-married-discount-${plan.id}`}>
              <HeartHandshake className="h-3 w-3" />
              Married discount applied
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        <div className="space-y-3">
          <p className="font-medium text-foreground mb-2 border-b pb-1">Key Costs</p>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Annual Deductible</span>
            <span className="font-medium">${plan.annualDeductible}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              Out of Pocket Limit
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Maximum amount you'll pay out-of-pocket for covered services.</p>
                </TooltipContent>
              </Tooltip>
            </span>
            <span className="font-medium">{plan.outOfPocketLimit ? `$${plan.outOfPocketLimit}` : 'None'}</span>
          </div>
        </div>

        <div className="space-y-3">
          <p className="font-medium text-foreground mb-2 border-b pb-1">Coverage</p>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" />
            <span className="text-muted-foreground">Part A Coinsurance</span>
          </div>
          <div className="flex items-center gap-2">
            {plan.partBDeductibleCovered ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <span className="h-4 w-4 rounded-full border border-muted-foreground/30" />
            )}
            <span className="text-muted-foreground">Part B Deductible</span>
          </div>
          <div className="flex items-center gap-2">
            {plan.foreignTravelCovered ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <span className="h-4 w-4 rounded-full border border-muted-foreground/30" />
            )}
            <span className="text-muted-foreground">Foreign Travel</span>
          </div>
        </div>
        
        <div className="flex flex-col justify-end">
          {plan.notes && (
            <div className="bg-secondary/50 p-3 rounded-md text-xs text-muted-foreground italic mb-4">
              "{plan.notes}"
            </div>
          )}
          <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors" data-testid={`button-apply-${plan.id}`}>
            Select Plan
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { MedigapPlan } from '@workspace/api-client-react';
import { Info, Check, AlertCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LeadModal } from '@/components/LeadModal';

export function PlanCard({ plan }: { plan: MedigapPlan }) {
  const [modalOpen, setModalOpen] = useState(false);

  const discountPct = plan.householdDiscountRate
    ? `${Math.round(plan.householdDiscountRate * 100)}%`
    : null;

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

          {/* Household discount badge — only shown when actually applied */}
          {plan.householdDiscountApplied && discountPct && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full cursor-default"
                  data-testid={`badge-household-discount-${plan.id}`}
                >
                  <Check className="h-3 w-3" />
                  {discountPct} household discount applied
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-sm">
                <p className="font-medium mb-1">Eligibility requirement</p>
                <p>{plan.householdEligibility}</p>
                {plan.householdDiscountNotes && (
                  <p className="mt-1 text-muted-foreground">{plan.householdDiscountNotes}</p>
                )}
                <p className="mt-2 text-amber-700 font-medium">Confirm eligibility directly with this insurer before enrolling.</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Show available-but-not-applied discount so user knows it exists */}
          {!plan.householdDiscountApplied && discountPct && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full cursor-default">
                  <Info className="h-3 w-3" />
                  {discountPct} household discount available
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-sm">
                <p className="font-medium mb-1">Household discount not applied</p>
                <p>{plan.householdEligibility}</p>
                {plan.householdDiscountNotes && (
                  <p className="mt-1 text-muted-foreground">{plan.householdDiscountNotes}</p>
                )}
              </TooltipContent>
            </Tooltip>
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
            <div className="bg-secondary/50 p-3 rounded-md text-xs text-muted-foreground italic mb-3">
              "{plan.notes}"
            </div>
          )}
          <button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors mb-3"
            data-testid={`button-apply-${plan.id}`}
            onClick={() => setModalOpen(true)}
          >
            Select Plan
          </button>
          {/* Pricing disclaimer */}
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
            <span>Premiums are illustrative estimates. Actual rates vary by gender, state, and underwriting. Verify with a licensed broker.</span>
          </div>
        </div>
      </div>

      <LeadModal plan={plan} open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}

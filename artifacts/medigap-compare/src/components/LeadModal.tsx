import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { config } from '@/lib/config';
import type { MedigapPlan } from '@workspace/api-client-react';

interface LeadModalProps {
  plan: MedigapPlan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadModal({ plan, open, onOpenChange }: LeadModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [zip, setZip] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required.';
    if (!email.trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email.';
    if (!zip.trim()) e.zip = 'Zip code is required.';
    else if (!/^\d{5}$/.test(zip)) e.zip = 'Enter a 5-digit zip code.';
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Zip Code: ${zip}`,
      ``,
      `Selected Plan: Plan ${plan.planLetter} — ${plan.insurerName}`,
      `Monthly Premium: $${plan.monthlyPremium}/mo`,
      `AM Best Rating: ${plan.amBestRating}`,
    ].join('\n');

    const mailto =
      `mailto:${config.leadEmail}` +
      `?subject=${encodeURIComponent(config.leadSubject)}` +
      `&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    onOpenChange(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) { setName(''); setEmail(''); setZip(''); setErrors({}); }
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Get More Information</DialogTitle>
          <DialogDescription>
            You selected <strong>Plan {plan.planLetter}</strong> from{' '}
            <strong>{plan.insurerName}</strong> at{' '}
            <strong>${plan.monthlyPremium}/mo</strong>. Fill in your details and
            we'll follow up.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="lead-name">Full Name</Label>
            <Input
              id="lead-name"
              placeholder="Jane Smith"
              value={name}
              onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lead-email">Email Address</Label>
            <Input
              id="lead-email"
              type="email"
              placeholder="jane@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lead-zip">Zip Code</Label>
            <Input
              id="lead-zip"
              placeholder="48201"
              maxLength={5}
              value={zip}
              onChange={e => { setZip(e.target.value.replace(/\D/g, '')); setErrors(p => ({ ...p, zip: '' })); }}
              aria-invalid={!!errors.zip}
            />
            {errors.zip && <p className="text-xs text-destructive">{errors.zip}</p>}
          </div>

          <Button type="submit" className="w-full mt-2">
            Send to {config.leadEmail}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

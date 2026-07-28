import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLocation } from 'wouter';
import { useGetZipInfo, getGetZipInfoQueryKey } from '@workspace/api-client-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { MapPin } from 'lucide-react';

const searchSchema = z.object({
  zip: z.string().regex(/^\d{5}$/, "Please enter a valid 5-digit zip code."),
  age: z.coerce.number().min(65, "You must be at least 65 to be eligible for Medigap."),
  married: z.boolean().default(false),
});

type SearchFormValues = z.infer<typeof searchSchema>;

interface SearchFormProps {
  defaultValues?: Partial<SearchFormValues>;
}

export function SearchForm({ defaultValues }: SearchFormProps) {
  const [, setLocation] = useLocation();

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      zip: defaultValues?.zip || "",
      age: defaultValues?.age || 65,
      married: defaultValues?.married || false,
    },
    mode: "onChange",
  });

  const zipValue = form.watch("zip") || "";
  const isZipValid = /^\d{5}$/.test(zipValue);

  const { data: zipInfo } = useGetZipInfo(
    { zip: zipValue },
    { query: { enabled: isZipValid, queryKey: getGetZipInfoQueryKey({ zip: zipValue }), staleTime: Infinity } }
  );

  const onSubmit = (data: SearchFormValues) => {
    const params = new URLSearchParams();
    params.set("zip", data.zip);
    params.set("age", data.age.toString());
    if (data.married) {
      params.set("married", "true");
    }
    setLocation(`/results?${params.toString()}`);
  };

  return (
    <div className="bg-card rounded-xl p-6 md:p-8 shadow-sm border text-left">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="zip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Zip Code</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input placeholder="e.g. 90210" {...field} className="h-12 text-lg" maxLength={5} data-testid="input-zip" />
                      {zipInfo && isZipValid && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                          <MapPin className="h-3 w-3 mr-1" />
                          {zipInfo.city}, {zipInfo.stateCode}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Age</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="65" {...field} className="h-12 text-lg" data-testid="input-age" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="pt-2 border-t">
            <FormField
              control={form.control}
              name="married"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg bg-muted/50 p-4 border border-transparent hover:border-border transition-colors">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base font-medium">Are you married?</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Some insurers offer a discount if you live with your spouse.
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-married"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" size="lg" className="w-full text-lg h-14 bg-primary text-primary-foreground hover:bg-primary/90 transition-transform active:scale-[0.98]" data-testid="button-submit-search">
            Compare Plans
          </Button>
        </form>
      </Form>
    </div>
  );
}

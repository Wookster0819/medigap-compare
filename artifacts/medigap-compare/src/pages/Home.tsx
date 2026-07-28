import { SearchForm } from '@/components/SearchForm';
import { PlanLettersInfo } from '@/components/PlanLettersInfo';
import { Header } from '@/components/Header';

export default function Home() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20">
      <Header />
      
      <main className="flex-grow">
        {/* Marketing Banner */}
        <div className="w-full">
          <img
            src="/banner.png"
            alt="GH2 Benefits — Medigap Quoting Tool"
            className="w-full object-cover"
            style={{ maxHeight: '240px' }}
          />
        </div>

        {/* Hero Section */}
        <section className="pt-12 pb-12 md:pt-16 md:pb-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center max-w-3xl mx-auto space-y-6 mb-12">
              <h1 className="text-4xl md:text-6xl font-serif text-foreground leading-tight">
                Clear, honest Medigap pricing. <span className="text-primary italic">No pressure.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Compare standardized Medicare Supplement plans in your area. See actual prices from top insurers without handing over your phone number to a salesperson.
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto relative z-0">
              {/* Decorative elements behind form */}
              <div className="absolute -inset-4 bg-secondary/50 rounded-2xl -z-10 blur-lg opacity-50"></div>
              <SearchForm />
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-16 bg-white border-t">
          <div className="container mx-auto px-4 max-w-6xl">
            <PlanLettersInfo />
          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-muted-foreground text-sm border-t bg-background">
        <p>© {new Date().getFullYear()} Medigap Clear. A trusted tool for seniors.</p>
      </footer>
    </div>
  );
}

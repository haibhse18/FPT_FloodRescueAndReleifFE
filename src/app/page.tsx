"use client";

import Link from "next/link";
import { Navigation } from "@/shared/ui/components/Navigation";
import { Footer } from "@/shared/ui/components/Footer";
import { Button } from "@/shared/ui/components/Button";
import { InfoCard } from "@/shared/ui/components/Card";
import {
  Shield,
  Heart,
  Users,
  ArrowRight,
  Activity,
  MapPin,
  Phone,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground">
      <Navigation
        logo={
          <div className="flex items-center gap-2 font-bold text-xl">
            <Shield className="w-8 h-8 text-primary" />
            <span>FloodRescue</span>
          </div>
        }
        variant="light"
        actions={
          <>
            <Button variant="ghost" size="sm" href="/login">
              Log in
            </Button>
            <Button variant="primary" size="sm" href="/register">
              Register
            </Button>
          </>
        }
      />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-[var(--color-surface)]">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] [mask-image:linear-gradient(0deg,transparent,black)]"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-6">
              Emergency Response Platform
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent pb-2">
              Connect. Rescue. Rebuild.
            </h1>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              A centralized platform bridging the gap between flood victims,
              rescue teams, and generous donors. Rapid response when it matters
              most.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="rounded-full px-8" href="/login">
                I Need Help
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8"
                href="/login"
              >
                Volunteering
              </Button>
            </div>
          </div>

          {/* Stats / Quick Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
            <div className="bg-card p-6 rounded-2xl border shadow-sm flex flex-col items-center text-center">
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                <Activity className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="font-bold text-lg mb-1">Real-time Alerts</h3>
              <p className="text-sm text-muted-foreground">
                Instant notifications for rising water levels and rescue
                requests.
              </p>
            </div>
            <div className="bg-card p-6 rounded-2xl border shadow-sm flex flex-col items-center text-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
                <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-bold text-lg mb-1">Live Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Interactive maps showing safe zones, danger areas, and team
                locations.
              </p>
            </div>
            <div className="bg-card p-6 rounded-2xl border shadow-sm flex flex-col items-center text-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-bold text-lg mb-1">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">
                Continuous coordination between victims and rescue operations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-24 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Who This Platform Is For
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Whether you are in need, want to help, or are managing operations,
              we have dedicated tools for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <InfoCard
              icon={<Users className="w-6 h-6 text-white" />}
              title="Citizens"
              description="Report emergencies, request evacuation, and find safe shelters near you. Receive real-time safety alerts."
              variant="accent"
            />
            <InfoCard
              icon={<Shield className="w-6 h-6 text-white" />}
              title="Rescue Teams"
              description="Receive coordinated tasks, track team members, and update mission status in real-time."
            />
            <InfoCard
              icon={<Heart className="w-6 h-6 text-white" />}
              title="Coordinators"
              description="Manage resources, dispatch teams effectively, and oversee the entire relief operation dashboard."
            />
          </div>
        </div>
      </section>

      {/* Mission/CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to make a difference?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-10 max-w-2xl mx-auto">
            Join our network of volunteers and professionals working together to
            save lives and support communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" href="/register">
              Join Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              href="/about"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      <Footer variant="light" />
    </main>
  );
}

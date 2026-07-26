"use client";

import {
  BarChart,
  Database,
  Layers,
  PieChart,
  SquareKanban,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { cn } from "@/lib/utils";

interface HeroSaasTab {
  title: string;
  image: Image;
}
interface Image {
  src: string;
  alt: string;
  srcDark?: string;
}
interface Button {
  text: string;
  url: string;
  icon?: React.ReactNode;
}
interface Buttons {
  primary?: Button;
  secondary?: Button;
}

interface HeroSaasProps {
  className?: string;
  heading: string;
  description: string;
  buttons?: Buttons;
  tabs?: HeroSaasTab[];
}

interface Hero195Props extends HeroSaasProps {}
type Props = Partial<Hero195Props>;

const defaultProps: Hero195Props = {
  heading: "The AI-powered CRM solution.",
  description:
    "Let AI help you manage accounts, deals, and handoffs in one place. Experience the future of CRM with AI-powered insights and automation.",
  buttons: {
    primary: {
      text: "Signup",
      url: "https://www.shadcnblocks.com",
    },
    secondary: {
      text: "Learn more",
      url: "https://www.shadcnblocks.com",
    },
  },
  tabs: [
    {
      title: "Insights",
      image: {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/saas-hero/saas-hero-1-16x9.png",
        srcDark: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/saas-hero/saas-hero-1-16x9-dark.png",
        alt: "Insights dashboard",
      },
    },
    {
      title: "Metrics",
      image: {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/saas-hero/saas-hero-2-16x9.png",
        srcDark: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/saas-hero/saas-hero-2-16x9-dark.png",
        alt: "Metrics overview",
      },
    },
    {
      title: "Trends",
      image: {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/saas-hero/saas-hero-3-16x9.png",
        srcDark: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/saas-hero/saas-hero-3-16x9-dark.png",
        alt: "Trends analysis",
      },
    },
    {
      title: "Sources",
      image: {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/saas-hero/saas-hero-4-16x9.png",
        srcDark: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/saas-hero/saas-hero-4-16x9-dark.png",
        alt: "Data sources",
      },
    },
    {
      title: "Models",
      image: {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/saas-hero/saas-hero-5-16x9.png",
        srcDark: "https://deifkwefumgah.cloudfront.net/shadcnblocks/image-set/modern/saas-hero/saas-hero-5-16x9-dark.png",
        alt: "Model configuration",
      },
    },
  ],
};

const TAB_ICONS: readonly LucideIcon[] = [
  SquareKanban,
  BarChart,
  PieChart,
  Database,
  Layers,
];

const Hero195 = (props: Props) => {
  const {
    heading,
    description,
    buttons,
    tabs = [],
    className,
  } = {
    ...defaultProps,
    ...props,
  };
  const [activeTab, setActiveTab] = useState(tabs[0]?.title ?? "");
  const activeIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.title === activeTab),
  );
  const ActiveIcon = TAB_ICONS[activeIndex % TAB_ICONS.length];

  return (
    <section className={cn("overflow-hidden", className)}>
      <div className="container">
        <div className="border-x border-border py-20">
          <div className="relative mx-auto max-w-4xl px-6 pt-8 pb-4 lg:p-2">
            <h1 className="mx-auto mt-6 max-w-4xl text-center text-3xl font-bold tracking-tight text-pretty md:text-4xl lg:text-6xl lg:tracking-tighter">
              {heading}
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-center text-sm text-muted-foreground md:text-base lg:text-xl">
              {description}
            </p>
            <div className="mx-auto mt-6 flex w-full max-w-sm flex-col gap-2 sm:max-w-none sm:flex-row sm:justify-center">
              {buttons?.primary && (
                <Button className="w-full sm:w-auto" render={<a href={buttons.primary.url} />} nativeButton={false}>{buttons.primary.text}</Button>
              )}
              {buttons?.secondary && (
                <Button className="w-full sm:w-auto" variant="outline" render={<a href={buttons.secondary.url} />} nativeButton={false}>{buttons.secondary.text}</Button>
              )}
            </div>
          </div>
          {tabs.length > 0 && (
            <div className="mt-4 md:mt-16 lg:mt-20">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="hidden md:block">
                  <TabsList className="mx-auto mb-6 flex h-auto w-fit flex-wrap justify-center gap-2 p-1 md:gap-2 lg:gap-3">
                    {tabs.map((tab, i) => {
                      const Icon = TAB_ICONS[i % TAB_ICONS.length];
                      return (
                        <TabsTrigger
                          key={tab.title}
                          value={tab.title}
                          className="gap-1.5 px-2 py-1 text-sm font-normal text-muted-foreground lg:gap-2 lg:px-3 lg:py-2 lg:text-base"
                        >
                          <Icon className="size-4 lg:size-5" aria-hidden />
                          {tab.title}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </div>
                <div className="relative isolate">
                  <div className="relative z-10">
                    {tabs.map((tab) => (
                      <TabsContent
                        key={tab.title}
                        value={tab.title}
                        className={cn(
                          "-mx-px bg-background transition-opacity duration-500",
                          {
                            "animate-in opacity-100 fade-in":
                              activeTab === tab.title,
                            "opacity-0": activeTab !== tab.title,
                          },
                        )}
                      >
                        <img
                          src={tab.image.src}
                          alt={tab.image.alt}
                          className="aspect-[16/10] w-full border border-border object-top shadow-[0_6px_20px_rgb(0,0,0,0.12)]"
                        />
                        <BorderBeam duration={8} size={100} />
                      </TabsContent>
                    ))}
                  </div>
                  <span className="absolute -inset-x-1/5 top-0 -z-10 h-px bg-border [mask-image:linear-gradient(to_right,transparent_1%,black_10%,black_90%,transparent_99%)]"></span>
                  <span className="absolute -inset-x-1/5 bottom-0 -z-10 h-px bg-border [mask-image:linear-gradient(to_right,transparent_1%,black_10%,black_90%,transparent_99%)]"></span>

                  <span className="absolute -inset-x-1/5 top-12 h-px border-t border-dashed border-border [mask-image:linear-gradient(to_right,transparent_1%,black_10%,black_90%,transparent_99%)]"></span>
                  <span className="absolute -inset-x-1/5 bottom-12 h-px border-t border-dashed border-border [mask-image:linear-gradient(to_right,transparent_1%,black_10%,black_90%,transparent_99%)]"></span>

                  <span className="absolute -inset-y-1/5 left-1/6 w-px border-r border-dashed border-border [mask-image:linear-gradient(to_bottom,transparent_1%,black_10%,black_90%,transparent_99%)]"></span>
                  <span className="absolute -inset-y-1/5 right-1/6 w-px border-r border-dashed border-border [mask-image:linear-gradient(to_bottom,transparent_1%,black_10%,black_90%,transparent_99%)]"></span>
                </div>
                <nav
                  className="mt-6 flex flex-col items-center gap-4 md:hidden"
                  aria-label="Feature slides"
                >
                  <div className="flex items-center gap-1.5" role="tablist">
                    {tabs.map((tab) => (
                      <button
                        key={tab.title}
                        type="button"
                        role="tab"
                        aria-selected={activeTab === tab.title}
                        aria-label={tab.title}
                        onClick={() => setActiveTab(tab.title)}
                        className={cn(
                          "h-1.5 rounded-full transition-all",
                          activeTab === tab.title
                            ? "w-8 bg-foreground"
                            : "w-1.5 bg-muted-foreground/40",
                        )}
                      />
                    ))}
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted">
                    <ActiveIcon
                      key={activeTab}
                      className="size-5 text-foreground"
                      aria-hidden
                    />
                  </div>
                </nav>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export { Hero195 };

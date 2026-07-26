import React from "react";

import {
  ArrowRight,
  Braces,
  Cpu,
  Keyboard,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";

import { ContainerTextFlip } from "@/components/ui/container-text-flip";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

interface Feature {
  title: string;
  description: string;
  icon: ElementType<{ className?: string }>;
  color?: string;
  href?: string;
}

interface HeroFeatureIconsProps {
  badge?: string;
  description?: string;
  buttonPrimary?: {
    text: string;
    href: string;
  };
  features?: Feature[];
  className?: string;
}

interface Hero243Props extends HeroFeatureIconsProps {
  /** Words cycled in the `ContainerTextFlip` accent (block-local animation). */
  flipWords?: string[];
  /** Lead copy immediately before the animated flip segment (block-local headline). */
  headingBeforeFlip: string;
  /** Trailing copy immediately after the animated flip segment. */
  headingAfterFlip: string;
}
type Props = Partial<Hero243Props>;

const defaultProps: Hero243Props = {
  badge: "Platform",
  description: "Components built with a modern, performant, and accessible foundation.",
  buttonPrimary: {
    text: "Browse blocks",
    href: "https://www.shadcnblocks.com",
  },
  features: [
    {
      title: "Composable patterns",
      description:
        "Ship faster with structured sections and consistent spacing.",
      icon: Braces,
    },
    {
      title: "Design tokens",
      description:
        "Theme and scale colors, type, and radii from a single coherent system.",
      icon: Cpu,
    },
    {
      title: "Accessible defaults",
      description:
        "Keyboard and screen-reader friendly building blocks out of the box.",
      icon: Keyboard,
    },
    {
      title: "Lightning fast",
      description:
        "Optimized bundles and lazy loading for instant page transitions.",
      icon: Zap,
    },
    {
      title: "Developer experience",
      description:
        "Predictable APIs and live examples that mirror production layouts.",
      icon: Sparkles,
    },
    {
      title: "Layered architecture",
      description:
        "Primitives, components, and blocks stack into full pages without lock-in.",
      icon: Layers,
    },
  ],
  heading: "",
  headingBeforeFlip: "Shadcn UI",
  headingAfterFlip: "built for the modern stack.",
  flipWords: flipWordsDefault,
};

/** Strip layout is tuned for exactly three cells (`lg:grid-cols-3`). */
const MAX_FEATURES = 3;

/** Block-local `ContainerTextFlip` words (override of **hero-feature-icons** pack defaults). */
const flipWordsDefault = ["Components", "Blocks", "Templates"];

const flipRowClassName =
  "relative pt-1 pb-2 text-4xl font-semibold tracking-tighter md:text-5xl lg:text-6xl";

const Hero243 = (props: Props) => {
  const {
    badge,
    description,
    buttonPrimary,
    features,
    flipWords,
    headingBeforeFlip,
    headingAfterFlip,
    className,
  } = {
    ...defaultProps,
    ...props,
  };

  const visibleFeatures = (features ?? []).slice(0, MAX_FEATURES);

  return (
    <section
      className={cn(
        "min-h-0 w-full max-w-full overflow-hidden py-32",
        className,
      )}
    >
      <div className="container mx-auto border-t border-b border-dashed">
        <div className="relative flex w-full max-w-5xl flex-col justify-start border border-t-0 border-dashed px-5 py-12 md:items-center md:justify-center lg:mx-auto">
          <p className="flex w-full items-center justify-center gap-3 text-center text-sm text-muted-foreground">
            <span className="inline-block size-2 shrink-0 rounded-full bg-primary" />
            {badge}
          </p>
          <div className="mt-3 mb-7 w-full max-w-xl text-center text-4xl font-semibold tracking-tighter md:mb-10 md:text-5xl lg:mb-0 lg:text-6xl">
            <h1 className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-y-2 text-center text-balance md:gap-y-3">
              <div className="flex w-full flex-col items-center justify-center gap-y-2 md:flex-row md:flex-wrap md:items-center md:justify-center md:gap-x-3 md:gap-y-0">
                <span className="inline shrink-0">{headingBeforeFlip}</span>
                <div className="inline-flex min-h-[1.15em] shrink-0 items-center justify-center">
                  <ContainerTextFlip
                    className={cn(flipRowClassName)}
                    words={flipWords ?? flipWordsDefault}
                  />
                </div>
              </div>
              <span className="block w-full">{headingAfterFlip}</span>
            </h1>
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center border border-t-0 border-b-0 border-dashed py-20">
          <div className="w-full max-w-2xl space-y-5 md:text-center">
            {description && (
              <p className="px-5 text-balance text-muted-foreground lg:text-lg">
                {description}
              </p>
            )}
            {buttonPrimary && (
              <Button className="mx-5 gap-2 rounded-lg" size="lg" render={<a href={buttonPrimary.href} />} nativeButton={false}>{buttonPrimary.text}<ArrowRight className="size-4" aria-hidden /></Button>
            )}
          </div>
        </div>
        <ul className="mx-auto grid h-44 w-full max-w-5xl grid-cols-1 border border-b-0 border-dashed md:h-34 md:grid-cols-2 lg:h-24 lg:grid-cols-3">
          {visibleFeatures.map((feature, index) => {
            const Icon = feature.icon;
            const itemClass =
              index === 0
                ? "flex h-full items-center justify-between gap-10 px-5 md:gap-3 lg:justify-center"
                : index === 1
                  ? "flex h-full items-center justify-between gap-10 border-t border-l border-dashed px-5 md:gap-3 lg:justify-center lg:border-t-0"
                  : "col-span-1 flex h-full items-center justify-between gap-10 border-t border-l border-dashed px-5 md:col-span-2 md:justify-center md:gap-3 lg:col-span-1 lg:border-t-0";
            return (
              <li key={feature.title} className={itemClass}>
                <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-6 text-muted-foreground" />
                </div>
                <p className="text-lg text-muted-foreground">{feature.title}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export { Hero243 };

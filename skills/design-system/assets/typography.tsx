// src/components/typography.tsx — the typographic vocabulary of the app.
// Pages use <Heading> and <Text>; they never pick font sizes or families ad hoc.
// Sizes and families come from the type scale and font tokens in styles/theme.css.
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

const headingVariants = cva('font-heading text-foreground', {
  variants: {
    level: {
      1: 'text-4xl font-bold',
      2: 'text-3xl font-semibold',
      3: 'text-2xl font-semibold',
      4: 'text-xl font-semibold',
    },
  },
  defaultVariants: { level: 2 },
});

type HeadingLevel = NonNullable<VariantProps<typeof headingVariants>['level']>;

export interface HeadingProps extends ComponentPropsWithoutRef<'h2'> {
  /** Semantic level (h1–h4). */
  level?: HeadingLevel;
  /** Visual level when it must differ from the semantic one. */
  look?: HeadingLevel;
}

export function Heading({ level = 2, look, className, ...props }: HeadingProps) {
  const Tag = `h${level}` as const;
  return <Tag className={cn(headingVariants({ level: look ?? level }), className)} {...props} />;
}

const textVariants = cva('', {
  variants: {
    variant: {
      body: 'text-base text-foreground',
      lead: 'text-lg text-muted-foreground',
      muted: 'text-sm text-muted-foreground',
      small: 'text-sm font-medium text-foreground',
      caption: 'text-xs text-muted-foreground',
      code: 'font-mono text-sm text-foreground',
    },
  },
  defaultVariants: { variant: 'body' },
});

type TextTag = 'p' | 'span' | 'div' | 'small' | 'code';

export interface TextProps
  extends ComponentPropsWithoutRef<'p'>,
    VariantProps<typeof textVariants> {
  as?: TextTag;
}

export function Text({ as: Tag = 'p', variant, className, ...props }: TextProps) {
  return <Tag className={cn(textVariants({ variant }), className)} {...props} />;
}

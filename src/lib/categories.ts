import { Bot, CircleHelp, GraduationCap, Globe, Landmark, LifeBuoy, MessageSquareText, Scale, Vote } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ProductCategory } from '../data/types'

export const CATEGORY_ICON: Record<ProductCategory, LucideIcon> = {
  'Election Technology': Vote,
  'Campaign Finance': Landmark,
  'Voter Outreach': MessageSquareText,
  Education: GraduationCap,
  'AI & Automation': Bot,
  'Customer Support': LifeBuoy,
  'Legal Technology': Scale,
  'Web Platforms': Globe,
  'Needs Classification': CircleHelp,
}

export const CATEGORY_KEY: Record<ProductCategory, string> = {
  'Election Technology': 'election',
  'Campaign Finance': 'finance',
  'Voter Outreach': 'outreach',
  Education: 'education',
  'AI & Automation': 'ai',
  'Customer Support': 'support',
  'Legal Technology': 'legal',
  'Web Platforms': 'web',
  'Needs Classification': 'unclassified',
}

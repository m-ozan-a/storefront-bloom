import {
  Truck,
  Shield,
  ShieldCheck,
  RotateCcw,
  CreditCard,
  Headphones,
  Package,
  Clock,
  Star,
  Heart,
  ShoppingCart,
  ShoppingBag,
  Gift,
  Phone,
  Mail,
  MapPin,
  Award,
  BadgeCheck,
  Lock,
  Leaf,
  Sparkles,
  Tag,
  Percent,
  Zap,
  ThumbsUp,
  CheckCircle2,
  type LucideIcon as LucideIconComponent,
} from "lucide-react";

// Curated commerce icon set. Hook-free → codegen
// server sayfasında render edilir. Agent TrustBadges/FeatureGrid icon alanına
// PascalCase Lucide adı (ör. "Truck") yazar; eşleşmezse emoji/metin fallback.
const ICONS: Record<string, LucideIconComponent> = {
  Truck,
  Shield,
  ShieldCheck,
  RotateCcw,
  CreditCard,
  Headphones,
  Package,
  Clock,
  Star,
  Heart,
  ShoppingCart,
  ShoppingBag,
  Gift,
  Phone,
  Mail,
  MapPin,
  Award,
  BadgeCheck,
  Lock,
  Leaf,
  Sparkles,
  Tag,
  Percent,
  Zap,
  ThumbsUp,
  CheckCircle2,
};

export function hasLucideIcon(name?: string | null): boolean {
  return !!name && name in ICONS;
}

export function LucideIcon({
  name,
  className,
}: {
  name?: string | null;
  className?: string;
}) {
  if (!name) return null;
  const Icon = ICONS[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}

/**
 * Wrapper central pour les icones lucide-react.
 * Usage : <Icon name="home" size={20} />
 * Toutes les icones utilisent le meme strokeWidth (2) et sont aria-hidden.
 */
import {
  Home, Search, MapPin, User, Bell, MessageCircle, Package,
  Smartphone, Laptop, Tv, Shirt, Sofa, Bike, ShoppingBag,
  Plus, AlertTriangle, X, Check, Clock, Heart, Bookmark,
  Phone, Rocket, Store, Sparkles, Camera, Wallet, Gift,
  Truck, Eye, Menu, LogOut, Settings, Star, ChevronRight,
  ChevronDown, LogIn, UserPlus, HelpCircle, Shield,
  FileText, Mail, Send, Loader2, Trash2, Pencil, PlusCircle,
  CheckCircle2, XCircle, AlertCircle, Info, Filter, SlidersHorizontal,
  Handshake, Target, ClipboardList, ShoppingCart, Ban, Bug,
} from 'lucide-react'

const ICONS = {
  home: Home,
  search: Search,
  'map-pin': MapPin,
  user: User,
  bell: Bell,
  message: MessageCircle,
  plus: Plus,
  'plus-circle': PlusCircle,
  smartphone: Smartphone,
  laptop: Laptop,
  tv: Tv,
  shirt: Shirt,
  sofa: Sofa,
  bike: Bike,
  package: Package,
  'shopping-bag': ShoppingBag,
  warning: AlertTriangle,
  'alert-circle': AlertCircle,
  'alert-triangle': AlertTriangle,
  info: Info,
  check: Check,
  'check-circle': CheckCircle2,
  'x-circle': XCircle,
  x: X,
  clock: Clock,
  loader: Loader2,
  heart: Heart,
  bookmark: Bookmark,
  phone: Phone,
  rocket: Rocket,
  store: Store,
  sparkles: Sparkles,
  camera: Camera,
  wallet: Wallet,
  gift: Gift,
  truck: Truck,
  eye: Eye,
  menu: Menu,
  'log-out': LogOut,
  'log-in': LogIn,
  'user-plus': UserPlus,
  settings: Settings,
  star: Star,
  trash: Trash2,
  pencil: Pencil,
  send: Send,
  filter: Filter,
  sliders: SlidersHorizontal,
  'help-circle': HelpCircle,
  shield: Shield,
  'file-text': FileText,
  mail: Mail,
  'clipboard-list': ClipboardList,
  'shopping-cart': ShoppingCart,
  ban: Ban,
  bug: Bug,
  handshake: Handshake,
  target: Target,
  'chevron-right': ChevronRight,
  'chevron-down': ChevronDown,
}

function Icon({ name, size = 20, strokeWidth = 2, className = '', ...rest }) {
  const Component = ICONS[name]
  if (!Component) {
    if (import.meta.env.DEV) {
      console.warn('[Icon] icone inconnue :', name)
    }
    return null
  }
  return (
    <Component
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden="true"
      {...rest}
    />
  )
}

export default Icon

export interface ProductTag {
  id: string;
  name: string;
  color: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories: string[];
}

export const CATEGORIES: Category[] = [
  {
    id: "charging-cables",
    name: "Charging Cables",
    icon: "🔌",
    subcategories: [
      "USB-C to USB-C",
      "USB-C to Lightning",
      "Micro USB",
      "3-in-1 Cable",
      "Magnetic Cable",
    ],
  },
  {
    id: "chargers-adapters",
    name: "Chargers & Adapters",
    icon: "⚡",
    subcategories: [
      "Wall Charger",
      "Car Charger",
      "Wireless Charger",
      "GaN Charger",
      "Multi-Port Charger",
    ],
  },
  {
    id: "power-banks",
    name: "Power Banks",
    icon: "🔋",
    subcategories: [
      "5000mAh",
      "10000mAh",
      "20000mAh+",
      "Solar Power Bank",
      "MagSafe Power Bank",
    ],
  },
  {
    id: "headphones-earphones",
    name: "Headphones & Earphones",
    icon: "🎧",
    subcategories: [
      "Wireless Earbuds",
      "Neckband",
      "On-Ear",
      "Over-Ear",
      "Gaming Headset",
    ],
  },
  {
    id: "speakers",
    name: "Speakers",
    icon: "🔊",
    subcategories: [
      "Bluetooth Speaker",
      "Portable Speaker",
      "Mini Speaker",
      "Soundbar",
    ],
  },
  {
    id: "screen-protectors",
    name: "Screen Protectors",
    icon: "🛡️",
    subcategories: [
      "Tempered Glass",
      "Privacy Screen",
      "Anti-Glare",
      "Matte Finish",
    ],
  },
  {
    id: "cases-covers",
    name: "Cases & Covers",
    icon: "📱",
    subcategories: [
      "Clear Case",
      "Silicone Case",
      "Leather Case",
      "Rugged Case",
      "Folio Case",
    ],
  },
  {
    id: "mounts-stands",
    name: "Mounts & Stands",
    icon: "📐",
    subcategories: [
      "Car Mount",
      "Desk Stand",
      "Tripod",
      "Ring Holder",
      "Magnetic Mount",
    ],
  },
  {
    id: "cables-connectors",
    name: "Cables & Connectors",
    icon: "🔗",
    subcategories: [
      "HDMI Cable",
      "AUX Cable",
      "OTG Adapter",
      "USB Hub",
      "Ethernet Adapter",
    ],
  },
  {
    id: "storage-devices",
    name: "Storage Devices",
    icon: "💾",
    subcategories: [
      "USB Flash Drive",
      "SD Card",
      "External SSD",
      "Card Reader",
    ],
  },
  {
    id: "gaming-accessories",
    name: "Gaming Accessories",
    icon: "🎮",
    subcategories: [
      "Controller",
      "Mobile Grip",
      "Cooling Fan",
      "Trigger Button",
      "Gaming Case",
    ],
  },
  {
    id: "smartwatch-accessories",
    name: "Smartwatch Accessories",
    icon: "⌚",
    subcategories: [
      "Watch Strap",
      "Screen Guard",
      "Charging Dock",
      "Case Cover",
    ],
  },
  {
    id: "keyboard-mouse",
    name: "Keyboard & Mouse",
    icon: "⌨️",
    subcategories: [
      "Wireless Keyboard",
      "Gaming Mouse",
      "Mouse Pad",
      "Combo Set",
    ],
  },
  {
    id: "webcam-microphone",
    name: "Webcam & Microphone",
    icon: "📹",
    subcategories: [
      "HD Webcam",
      "Ring Light",
      "Lavalier Mic",
      "USB Mic",
      "Streaming Kit",
    ],
  },
  {
    id: "other-accessories",
    name: "Other Accessories",
    icon: "🔧",
    subcategories: [
      "Stylus Pen",
      "SIM Ejector",
      "Dust Plug",
      "Cleaning Kit",
      "Cable Organizer",
    ],
  },
];

export const PRODUCT_TAGS: ProductTag[] = [
  { id: "new-arrival", name: "New Arrival", color: "#00A884" },
  { id: "best-seller", name: "Best Seller", color: "#FF6B6B" },
  { id: "fast-charging", name: "Fast Charging", color: "#FFD93D" },
  { id: "wireless", name: "Wireless", color: "#6C5CE7" },
  { id: "gaming", name: "Gaming", color: "#A8E6CF" },
  { id: "premium", name: "Premium", color: "#FFB347" },
  { id: "budget-friendly", name: "Budget Friendly", color: "#74B9FF" },
  { id: "waterproof", name: "Waterproof", color: "#00B894" },
  { id: "magsafe", name: "MagSafe", color: "#E17055" },
  { id: "limited-edition", name: "Limited Edition", color: "#D63031" },
  { id: "eco-friendly", name: "Eco-Friendly", color: "#27AE60" },
  { id: "travel-ready", name: "Travel Ready", color: "#0984E3" },
];

export const COMPATIBILITY_OPTIONS = [
  "iPhone 15",
  "iPhone 14",
  "iPhone 13",
  "iPhone 12",
  "iPhone 11",
  "iPhone SE",
  "Android USB-C",
  "Android Micro USB",
  "iPad",
  "iPad Pro",
  "MacBook",
  "MacBook Air",
  "Laptop USB-C",
  "Gaming Console",
  "Smartwatch",
  "Universal",
];

export const WARRANTY_OPTIONS = [
  "No Warranty",
  "3 Months",
  "6 Months",
  "1 Year",
  "2 Years",
  "3 Years",
  "5 Years",
  "Lifetime",
];

export const COLORS = [
  "Black",
  "White",
  "Silver",
  "Gold",
  "Rose Gold",
  "Blue",
  "Red",
  "Green",
  "Purple",
  "Grey",
  "Navy",
  "Yellow",
  "Orange",
  "Pink",
  "Transparent",
  "Multicolor",
];

export const MATERIALS = [
  "Silicone",
  "Plastic",
  "Metal",
  "Aluminum",
  "Platinum",
  "Rubber",
  "Leather",
  "Fabric",
  "TPU",
  "Polycarbonate",
  "Glass",
  "Ceramic",
  "Braided Nylon",
  "ABS",
  "Zinc Alloy",
  "Stainless Steel",
  "Carbon Fiber",
];

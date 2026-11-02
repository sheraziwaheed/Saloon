export const photo = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;
export const images = {
  hero: photo("photo-1600948836101-f9ffda59d250", 2000),
  hair: photo("photo-1562322140-8baeececf3df"),
  skin: photo("photo-1570172619644-dfd03ed5d881"),
  nails: photo("photo-1604654894610-df63bc536371"),
  makeup: photo("photo-1487412947147-5cebf100ffc2"),
  spa: photo("photo-1544161515-4ab6ce6db874"),
  grooming: photo("photo-1503951914875-452162b0f3f1"),
  salon: photo("photo-1527799820374-dcf8d9d4a388"),
};
export const categories = [
  {
    id: "hair",
    name: "Hair & Colour",
    image: images.hair,
    description: "Good hair. A whole new feeling.",
  },
  {
    id: "skin",
    name: "Skin & Facials",
    image: images.skin,
    description: "A fresh start for your skin.",
  },
  {
    id: "nails",
    name: "Nails & Beauty",
    image: images.nails,
    description: "The little details, beautifully done.",
  },
  {
    id: "makeup",
    name: "Makeup & Bridal",
    image: images.makeup,
    description: "For your moments in the spotlight.",
  },
  {
    id: "spa",
    name: "Spa & Massage",
    image: images.spa,
    description: "Slow down. Come back to yourself.",
  },
  {
    id: "grooming",
    name: "Men’s Grooming",
    image: images.grooming,
    description: "Considered care. Effortless confidence.",
  },
];
const menu: [string, string, number, number][] = [
  ["Signature Cut & Finish", "hair", 6500, 60],
  ["Blow Dry & Style", "hair", 3500, 45],
  ["Balayage & Gloss", "hair", 14500, 150],
  ["Root Colour", "hair", 6500, 75],
  ["Deep Conditioning Ritual", "hair", 3000, 30],
  ["Signature Glow Facial", "skin", 7500, 60],
  ["Hydration Reset", "skin", 6500, 60],
  ["Clarifying Facial", "skin", 7000, 60],
  ["Express Radiance", "skin", 4000, 30],
  ["Brow Shape & Tint", "skin", 2500, 30],
  ["Classic Manicure", "nails", 2800, 45],
  ["Gel Manicure", "nails", 3800, 60],
  ["Luxury Pedicure", "nails", 4500, 60],
  ["Gel Removal", "nails", 1500, 15],
  ["Full Leg Wax", "nails", 3500, 45],
  ["Occasion Makeup", "makeup", 7500, 60],
  ["Bridal Preview", "makeup", 9500, 90],
  ["Bridal Makeup", "makeup", 18000, 120],
  ["Lash Enhancement", "makeup", 3500, 45],
  ["Aromatherapy Massage", "spa", 8000, 60],
  ["Deep Tissue Massage", "spa", 8500, 60],
  ["Back & Shoulder Release", "spa", 4500, 30],
  ["Scalp Serenity", "spa", 3500, 30],
  ["Gentleman’s Cut", "grooming", 4000, 45],
  ["Beard Shape & Finish", "grooming", 2200, 30],
  ["Grooming Ritual", "grooming", 6500, 75],
  ["Free Consultation", "hair", 0, 15],
];
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
export const services = menu.map(([name, categoryId, price, duration]) => ({
  id: slugify(name),
  slug: slugify(name),
  name,
  categoryId,
  price,
  duration,
  buffer: 15,
  description: `A personalised ${name.toLowerCase()} experience, thoughtfully tailored to you. Begin with a consultation, settle in with a drink, and let our experienced team take care of the details.`,
  image: categories.find((c) => c.id === categoryId)!.image,
}));
export const branches = [
  {
    id: "mayfair",
    name: "Mayfair",
    address: "24 Brook Street, London W1K 5DG",
    phone: "+44 20 7946 0832",
  },
  {
    id: "chelsea",
    name: "Chelsea",
    address: "118 King’s Road, London SW3 4TR",
    phone: "+44 20 7946 0833",
  },
];
export const staff = [
  {
    id: "amelia",
    name: "Amelia Rose",
    role: "Creative Director",
    branchId: "mayfair",
    image: photo("photo-1580489944761-15a19d654956"),
    bio: "Amelia brings a considered eye to beautifully wearable cuts and natural colour.",
  },
  {
    id: "sophia",
    name: "Sophia Chen",
    role: "Senior Skin Therapist",
    branchId: "mayfair",
    image: photo("photo-1534528741775-53994a69daeb"),
    bio: "A calm, thoughtful approach to skin, with rituals designed around your needs.",
  },
  {
    id: "olivia",
    name: "Olivia James",
    role: "Nail & Beauty Specialist",
    branchId: "mayfair",
    image: photo("photo-1524504388940-b1c1722653e1"),
    bio: "Meticulous finishes and a warm welcome make every visit a little brighter.",
  },
  {
    id: "isabella",
    name: "Isabella Grace",
    role: "Bridal & Makeup Artist",
    branchId: "chelsea",
    image: photo("photo-1524250502761-1ac6f2e30d43"),
    bio: "Soft, luminous makeup that feels as good as it looks, for every occasion.",
  },
  {
    id: "daniel",
    name: "Daniel Ellis",
    role: "Hair & Grooming Specialist",
    branchId: "chelsea",
    image: photo("photo-1500648767791-00dcc994a43e"),
    bio: "Precision cutting, easy conversation and a finish that works in real life.",
  },
  {
    id: "maya",
    name: "Maya Patel",
    role: "Wellness Therapist",
    branchId: "chelsea",
    image: photo("photo-1531123897727-8f129e1688ce"),
    bio: "Restorative bodywork and a genuinely peaceful moment in a busy week.",
  },
];
export const products = Array.from({ length: 12 }, (_, i) => ({
  id: `product-${i + 1}`,
  slug: `${["botanical-shampoo", "nourishing-conditioner", "glow-face-oil", "hydrating-serum", "hand-balm", "rose-bath-soak", "scalp-serum", "texture-mist", "daily-moisturiser", "cuticle-oil", "body-butter", "ritual-candle"][i]}`,
  name: [
    "Botanical Shampoo",
    "Nourishing Conditioner",
    "Glow Face Oil",
    "Hydrating Serum",
    "Hand & Nail Balm",
    "Rose Bath Soak",
    "Renew Scalp Serum",
    "Soft Texture Mist",
    "Daily Moisturiser",
    "Botanical Cuticle Oil",
    "Velvet Body Butter",
    "Evening Ritual Candle",
  ][i],
  description:
    "A considered essential for your everyday ritual. Chosen by our salon team for beautiful results at home.",
  price: [
    2600, 2800, 4200, 4800, 1800, 2400, 3600, 2500, 3800, 1600, 3200, 2900,
  ][i],
  image: photo(
    [
      "photo-1608571423902-eed4a5ad8108",
      "photo-1608248543803-ba4f8c70ae0b",
      "photo-1556229010-6c3f2c9ca5f8",
    ][i % 3],
  ),
  categoryId: i < 2 ? "haircare" : "wellness",
  brandId: "luxe",
  stock: 30,
}));
export const reviews = Array.from({ length: 10 }, (_, i) => ({
  name: [
    "Charlotte M.",
    "Sophie W.",
    "Emma R.",
    "Isla T.",
    "Grace L.",
    "Hannah P.",
    "Mia S.",
    "Lucy B.",
    "Alice D.",
    "Ella K.",
  ][i],
  rating: 5,
  text: [
    "From the warm welcome to the final blow dry, every little detail felt special. I walked out feeling like myself, only better.",
    "Such a peaceful space. My facial was tailored to my skin and the team took the time to really listen. Already booked my next visit.",
    "I finally found my salon. Beautiful colour, lovely people and a genuinely relaxed atmosphere. A little escape I look forward to.",
  ][i % 3],
  service: ["Hair & Colour", "Skin & Facials", "Signature Experience"][i % 3],
}));
export const faqs = [
  {
    question: "What should I book for my first visit?",
    answer:
      "Start with a complimentary consultation. We’ll talk through your goals, your routine and the time you have, then recommend the right service for you.",
  },
  {
    question: "Do I need a patch test before colour?",
    answer:
      "Yes. New colour clients need a patch test at least 48 hours before their appointment. Please contact your chosen salon to arrange yours.",
  },
  {
    question: "Can I change or cancel my appointment?",
    answer:
      "Please contact the salon directly to change or cancel your appointment. We ask for at least 24 hours’ notice.",
  },
  {
    question: "Which salon should I choose?",
    answer:
      "Both our Mayfair and Chelsea spaces offer a warm welcome and our signature standard of care. Tell us your preferred branch in your request. Our team will confirm availability.",
  },
  {
    question: "Do you offer gift vouchers?",
    answer:
      "Yes. Choose an amount on our gift vouchers page and contact our team to arrange a beautifully presented salon gift.",
  },
  {
    question: "Are your services suitable for sensitive skin?",
    answer:
      "Let us know about sensitivities, allergies or any recent treatments during your consultation. Your therapist can explain suitable options and patch testing.",
  },
];
export const posts = Array.from({ length: 6 }, (_, i) => ({
  id: `post-${i}`,
  slug: [
    "your-guide-to-effortless-hair",
    "a-moment-for-your-skin",
    "the-modern-bridal-edit",
    "make-your-manicure-last",
    "find-your-calm",
    "a-new-season-of-colour",
  ][i],
  title: [
    "Your guide to effortlessly beautiful hair",
    "A little time for your skin",
    "The modern bridal beauty edit",
    "Make your manicure last longer",
    "Finding calm in the everyday",
    "A new season of beautiful colour",
  ][i],
  excerpt:
    "Thoughtful advice, expert tips and a little inspiration from the Luxe team.",
  content:
    "Beautiful care begins with understanding what works for you. At Luxe, we believe a considered routine should feel simple and personal. Start with the essentials, make time for regular care, and ask your stylist or therapist for advice tailored to you.\n\nKeep your routine gentle and consistent. Protect your hair and skin from heat and the elements, and give yourself permission to slow down. For personalised recommendations, book a complimentary consultation with our team.",
  category: ["Hair", "Skin", "Bridal", "Nails", "Wellness", "Hair"][i],
  image: categories[i].image,
}));
export const money = (p: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: p % 100 ? 2 : 0,
  }).format(p / 100);

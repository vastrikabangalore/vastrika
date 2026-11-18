// Details used across the site. Replace the email with your real address.
export const site = {
  name: 'Vastrika',
  email: 'hello@example.com',
  location: 'Bangalore, India',
}

export const services = [
  { title: 'Bespoke couture', desc: 'One-of-a-kind garments designed and tailored to you.' },
  { title: 'Bridal and occasion', desc: 'Lehengas, sarees and trousseau styling for your special day.' },
  { title: 'Styling consultation', desc: 'Personal wardrobe and event styling sessions.' },
]

// Sample content, shown only until Supabase is connected.
const sampleCollections = [
  { name: 'Ananta', season: 'Festive 2026', description: 'Handwoven silks with zari detailing, reimagined in modern drapes.', color: '#7b2233' },
  { name: 'Mitti', season: 'Spring/Summer 2026', description: 'Earth-toned cottons, block prints and natural dyes.', color: '#94643c' },
  { name: 'Neela', season: 'Resort 2026', description: 'Indigo shibori and breezy silhouettes for coastal escapes.', color: '#27386b' },
  { name: 'Swarna', season: 'Bridal 2025', description: 'Heirloom embroidery and gold-thread lehengas for the modern bride.', color: '#a5832f' },
]

const slugOf = (name) => name.toLowerCase()

export const sample = {
  collections: sampleCollections.map((c) => ({
    ...c,
    id: slugOf(c.name),
    slug: slugOf(c.name),
    cover_image_url: null,
  })),
  designs: sampleCollections.map((c) => ({
    id: `${slugOf(c.name)}-design`,
    title: `${c.name} drape`,
    slug: `${slugOf(c.name)}-drape`,
    description: c.description,
    fabric: null,
    colors: [],
    tags: [],
    design_year: null,
    is_featured: true,
    color: c.color,
    category: null,
    collection: { name: c.name, slug: slugOf(c.name) },
    images: [],
  })),
  categories: [],
  posts: [],
}

// Details used across the site.
export const site = {
  name: 'Vastrika',
  designer: 'Venkateshwari',
  email: 'vastrika.bangalore@gmail.com',
  location: 'Bangalore, India',
}

export const crafts = ['Handloom', 'Zari', 'Block print', 'Shibori', 'Hand embroidery', 'Natural dye']

export const statement =
  'Vastrika is the Bangalore label of designer Venkateshwari, bringing Indian textiles and contemporary silhouettes together, one considered piece at a time.'

export const services = [
  { title: 'Bespoke couture', desc: 'One-of-a-kind garments designed and tailored to you.' },
  { title: 'Bridal and occasion', desc: 'Lehengas, sarees and trousseau styling for your special day.' },
  { title: 'Styling consultation', desc: 'Personal wardrobe and event styling sessions.' },
]

// Sample content, shown only until Supabase is connected.
const look = (n) => `${import.meta.env.BASE_URL}samples/look${n}.webp`
const image = (n, index) => ({
  id: `sample-${n}-${index}`,
  url: look(n),
  alt_text: 'Sample fabric image',
  is_cover: index === 0,
  sort_order: index,
})

const categories = [
  { id: 'bridal', name: 'Bridal', slug: 'bridal' },
  { id: 'sarees', name: 'Sarees', slug: 'sarees' },
  { id: 'ready-to-wear', name: 'Ready-to-wear', slug: 'ready-to-wear' },
]

const sampleCollections = [
  ['Ananta', 'Festive 2026', 'Handwoven silks with zari detailing, reimagined in modern drapes.', 1, 'Ananta silk saree', 'sarees'],
  ['Neela', 'Resort 2026', 'Indigo shibori and breezy silhouettes for coastal escapes.', 2, 'Neela shibori kaftan', 'ready-to-wear'],
  ['Mitti', 'Spring/Summer 2026', 'Earth-toned cottons, block prints and natural dyes.', 3, 'Mitti block-print set', 'ready-to-wear'],
  ['Swarna', 'Bridal 2025', 'Heirloom embroidery and gold-thread lehengas for the modern bride.', 4, 'Swarna bridal lehenga', 'bridal'],
  ['Kesari', 'Capsule 2025', 'Saffron hues and hand-painted motifs in everyday wear.', 6, 'Kesari painted drape', 'sarees'],
  ['Chaya', 'Autumn/Winter 2025', 'Layered textures, muted shades and structured jackets.', 5, 'Chaya layered jacket', 'ready-to-wear'],
]

const slugOf = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-')

export const sample = {
  categories,
  posts: [],
  collections: sampleCollections.map(([name, season, description, n]) => ({
    id: slugOf(name),
    slug: slugOf(name),
    name,
    season,
    description,
    cover_image_url: look(n),
  })),
  designs: sampleCollections.map(([name, , description, n, title, category], index) => ({
    id: slugOf(title),
    slug: slugOf(title),
    title,
    description,
    fabric: null,
    colors: [],
    tags: [],
    design_year: 2026,
    is_featured: true,
    sort_order: index,
    category: categories.find((c) => c.id === category),
    collection: { name, slug: slugOf(name) },
    images: [image(n, 0), image((n % 8) + 1, 1), image(((n + 1) % 8) + 1, 2)],
  })),
}

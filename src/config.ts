// Set real URLs when ready. Empty links are shown as “not added yet”.
export const profile = {
  name: 'Aldo Casanova',
  role: 'Computer Science Engineering student',
  location: 'Sucre, Bolivia',
  image: '/img/uwu.jpeg',
  github: '',
  linkedin: '',
};

// Projects selected by Aldo; descriptions reflect the local project documentation.
// Add verified public URLs when ready; an empty URL renders no link.
export const projects = [
  {
    id: 'sucre-mappo',
    name: 'Traffic signal control in Sucre',
    category: 'Multi-agent reinforcement learning',
    summary: 'Coordinating Sucre’s traffic signals through multi-agent reinforcement learning and simulation.',
    description: 'A research project exploring traffic signal coordination with Multi-Agent Proximal Policy Optimization (MAPPO). A SUMO model of Sucre provides the environment for training and comparing policies against fixed-time and actuated traffic control.',
    details: 'The workflow includes a multi-agent environment, parallel training, checkpoint selection, and evaluation on held-out scenarios. Experiments use synthetic traffic demand in simulation.',
    technologies: ['Python', 'PyTorch', 'SUMO', 'PettingZoo', 'MAPPO'],
    url: '',
    // Add a local /img/... path, descriptive alt text, and an optional caption.
    image: { src: '', alt: '', caption: '' },
  },
  {
    id: 'capital-pets',
    name: 'Capital Pets',
    category: 'Full-stack web application',
    summary: 'An online pet supply store with product, inventory, and sales management.',
    description: 'An e-commerce application for pet food and accessories, with a product catalog, shopping cart, customer accounts, and an administration area for managing products, categories, inventory, and sales.',
    details: 'A Nuxt and Vue frontend connects to an Express API written in TypeScript. PostgreSQL and Prisma handle product and sales data, with Cloudinary for product images.',
    technologies: ['Nuxt', 'Vue', 'TypeScript', 'Express', 'PostgreSQL', 'Prisma'],
    url: '',
    // Add a local /img/... path, descriptive alt text, and an optional caption.
    image: { src: '', alt: '', caption: '' },
  },
];

// Authorship and context confirmed by Aldo. Links remain in src/config.ts.
export const caseStudies = {
  'sucre-mappo': {
    label: '01 / Research',
    context: 'University research · Sucre, Bolivia',
    role: 'Principal author',
    introduction: 'I developed this university research project to explore how multiple traffic signals can coordinate their decisions. The work brings together a city-scale SUMO model, a multi-agent learning environment, and a common evaluation protocol.',
    problem: 'A change at one junction affects the traffic reaching the next. The research asks how a learned coordination policy compares with fixed-time and actuated controllers under the same simulated demand.',
    steps: [
      { title: 'City model', detail: 'Sucre road network in SUMO' },
      { title: 'Environment', detail: 'TraCI + parallel PettingZoo API' },
      { title: 'Learning', detail: 'MAPPO policy and value models' },
      { title: 'Evaluation', detail: 'Held-out scenarios + baselines' },
    ],
    decisions: [
      { title: 'A shared simulation interface', body: 'The PettingZoo environment connects traffic observations and control actions to SUMO through TraCI. This separates the learning algorithm from the traffic simulator.' },
      { title: 'Separate training from evaluation', body: 'Parallel environments support training. Checkpoints are selected before the final benchmark, and additional unseen scenarios test whether the policy generalizes beyond a single demand realization.' },
      { title: 'Keep the full-precision policy', body: 'Dynamic INT8 quantization was evaluated locally. The documented comparison did not meet the project’s action-agreement and traffic-performance criteria, so FP32 was retained.' },
    ],
    challenge: 'The main difficulty is making comparisons interpretable: demand, controller settings, checkpoint selection, and the metric protocol all affect the result. The project includes baseline controllers and separate evaluation scenarios to keep these comparisons explicit.',
    outcome: 'The project produced a reproducible simulation and evaluation workflow, a selected trained policy, and a local inference demonstration. The benchmark and zero-shot evaluations are documented alongside the implementation.',
    limits: 'Demand is synthetic. The repository does not contain field traffic counts, so these experiments do not demonstrate real-world deployment or empirical calibration to Sucre traffic. Performance depends on the scenario and metric.',
    evidence: ['SUMO network and scenario validation', 'Fixed-time and actuated baseline controllers', 'Checkpoint comparison and held-out evaluation', 'FP32 inference and quantization comparison'],
  },
  'capital-pets': {
    label: '02 / Web application',
    context: 'Commission for a family business',
    role: 'Principal author',
    introduction: 'Capital Pets is a family business that commissioned me to build its website. I developed the application around two connected needs: presenting the product catalog to customers and giving the business a place to manage products, inventory, and sales.',
    problem: 'An online storefront and the day-to-day operation of a shop need to work with the same product information. The application connects the customer-facing catalog with administration workflows for the business.',
    steps: [
      { title: 'Storefront', detail: 'Nuxt + Vue customer interface' },
      { title: 'Application API', detail: 'Express + TypeScript' },
      { title: 'Data', detail: 'PostgreSQL + Prisma' },
      { title: 'Product media', detail: 'Cloudinary image storage' },
    ],
    decisions: [
      { title: 'Separate presentation and business operations', body: 'A Nuxt frontend communicates with an Express API. The separation keeps product and sales operations in the backend while the interface serves customer and administrator workflows.' },
      { title: 'Model stock alongside sales', body: 'Products, categories, sales, and sale items are represented in PostgreSQL through Prisma. The administration workflow supports recording manual sales as well as managing the online catalog.' },
      { title: 'Give administration a dedicated workflow', body: 'The application distinguishes customer and administrator roles. Product, category, inventory, and sales management are grouped in the administration area.' },
    ],
    challenge: 'The interface serves people with different goals: customers browsing products and a small business maintaining its catalog. Keeping these workflows separate while sharing the underlying data was a central design constraint.',
    outcome: 'The implemented scope includes a product catalog, shopping cart, customer accounts, and an administration area for products, categories, inventory, and sales. Product images are handled through Cloudinary.',
    limits: 'This case study describes the implemented scope. It does not claim measured conversion gains, sales growth, or a verified production deployment. Public links will be added separately.',
    evidence: ['Customer catalog, cart, and account flows', 'Product and category administration', 'Inventory and manual sales workflow', 'Documented frontend, API, and data model'],
  },
} as const;

/**
 * projects-data.js — Datos centralizados de proyectos
 * Utilizado por project.html / project.js para renderizar la página de detalle.
 *
 * Para agregar o editar un proyecto, modifica el arreglo PROJECTS_DATA:
 *   - id          : slug único usado en la URL (?id=...)
 *   - category    : 'data-science' | 'web' | 'software'
 *   - cover       : ruta a la imagen (null para gradiente)
 *   - year        : año del proyecto
 *   - title       : { es, en }
 *   - subtitle    : { es, en }  — aparece bajo el título en el hero
 *   - description : { es, en }  — párrafo principal
 *   - context     : { es, en }  — sección "Contexto"
 *   - methodology : { es, en }  — sección "Metodología" (acepta HTML)
 *   - results     : { es, en }  — sección "Resultados"
 *   - tags        : array de strings
 *   - links       : array de { label, url, style ('outline'|'ghost'|'primary'), download? }
 *   - sections    : array de secciones libres (generado desde admin.html)
 *                   cada sección: { title: string, blocks: [ {type:'text'|'image', content, caption?} ] }
 */

var PROJECTS_DATA = [

  /* ── 1. UTEC — Siniestros de Tránsito ─────────────────────── */
  {
    id: 'siniestros-utec',
    category: 'data-science',
    cover: 'assets/mvd.jpg',
    year: '2024',
    title: {
      es: 'UTEC · Análisis de Siniestros de Tránsito (Montevideo 2022)',
      en: 'UTEC · Traffic Accident Analysis (Montevideo 2022)'
    },
    subtitle: {
      es: 'Fundamentos de Programación para Ciencia de Datos · UTEC',
      en: 'Fundamentals of Programming for Data Science · UTEC'
    },
    description: {
      es: 'Análisis exploratorio de datos abiertos de la Intendencia de Montevideo (2022) sobre siniestros de tránsito. Mediante Python, Pandas, Matplotlib, Seaborn y Plotly identifiqué patrones por día, hora, tipo de vehículo y zona geográfica. Los miércoles y tardes concentran el mayor riesgo; los motociclistas representan el 58 % de los siniestros urbanos.',
      en: 'Exploratory data analysis of open data from the Municipality of Montevideo (2022) on traffic accidents. Using Python, Pandas, Matplotlib, Seaborn and Plotly, I identified patterns by day, time, vehicle type and geographic area. Wednesdays and afternoons concentrate the highest risk; motorcyclists account for 58 % of urban accidents.'
    },
    context: {
      es: 'Proyecto desarrollado en el marco de la materia <strong>Fundamentos de Programación para Ciencia de Datos</strong> de la Especialización en Ciencia de Datos e Inteligencia Artificial (UTEC · MIT). El dataset utilizado contiene registros oficiales de la Intendencia de Montevideo correspondientes al año 2022, disponibles como datos abiertos.',
      en: 'Project developed as part of the <strong>Fundamentals of Programming for Data Science</strong> course in the Data Science and Artificial Intelligence Specialization (UTEC · MIT). The dataset contains official records from the Municipality of Montevideo for 2022, available as open data.'
    },
    methodology: {
      es: '<ul><li>Carga y limpieza del dataset (valores nulos, tipos de datos, duplicados)</li><li>Análisis univariado y bivariado con Pandas</li><li>Visualizaciones temporales: distribución por hora, día de semana y mes</li><li>Segmentación por tipo de vehículo y gravedad del siniestro</li><li>Mapa coroplético de densidad por barrio con Plotly</li></ul>',
      en: '<ul><li>Dataset loading and cleaning (null values, data types, duplicates)</li><li>Univariate and bivariate analysis with Pandas</li><li>Time-based visualizations: distribution by hour, weekday and month</li><li>Segmentation by vehicle type and accident severity</li><li>Choropleth density map by neighborhood with Plotly</li></ul>'
    },
    results: {
      es: 'Los resultados muestran que los miércoles y las tardes (17–19 h) concentran la mayor cantidad de siniestros. Los motociclistas son el grupo más afectado (58 %), seguidos por peatones y ciclistas. Las zonas centro y Ciudad Vieja presentan mayor densidad de incidentes. Estas conclusiones pueden orientar políticas públicas de seguridad vial.',
      en: 'Results show that Wednesdays and afternoons (5–7 pm) concentrate the highest number of accidents. Motorcyclists are the most affected group (58 %), followed by pedestrians and cyclists. The downtown and Ciudad Vieja areas show the highest incident density. These findings can inform public road safety policies.'
    },
    tags: ['Python', 'Pandas', 'Matplotlib', 'Seaborn', 'Plotly', 'EDA'],
    links: [
      { label: 'GitHub',  url: 'https://github.com/geramargonzalez/UTEC-SiniestrosAnalisis', style: 'outline' },
      { label: 'Colab',   url: 'https://colab.research.google.com/github/geramargonzalez/UTEC-SiniestrosAnalisis/blob/main/siniestrosAnalisis.ipynb', style: 'ghost' },
      { label: 'Dataset', url: 'https://raw.githubusercontent.com/geramargonzalez/UTEC-SiniestrosAnalisis/main/preprocesamiento.csv', style: 'ghost', download: true }
    ]
  },

  /* ── 2. Detección de Campos en Facturas — U-Net ────────────── */
  {
    id: 'invoices-unet',
    category: 'data-science',
    cover: 'assets/fielddetection.jpg',
    year: '2024',
    title: {
      es: 'Detección de Campos en Facturas mediante Segmentación Semántica con U-Net',
      en: 'Invoice Field Detection via Semantic Segmentation with U-Net'
    },
    subtitle: {
      es: 'Deep Learning · Computer Vision · UTEC',
      en: 'Deep Learning · Computer Vision · UTEC'
    },
    description: {
      es: 'Modelo de segmentación semántica basado en la arquitectura U-Net para detectar y localizar campos clave en imágenes de facturas (fecha, monto, proveedor, etc.). Incluye preprocesamiento de imágenes, entrenamiento del modelo y evaluación con métricas de segmentación.',
      en: 'Semantic segmentation model based on U-Net architecture to detect and locate key fields in invoice images (date, amount, vendor, etc.). Includes image preprocessing, model training and evaluation with segmentation metrics.'
    },
    context: {
      es: 'La automatización del procesamiento de facturas es un problema crítico en finanzas y contabilidad. Este proyecto explora cómo la arquitectura U-Net, originalmente diseñada para imágenes médicas, puede adaptarse a documentos semi-estructurados como facturas comerciales para extraer información de forma automática.',
      en: 'Automating invoice processing is a critical problem in finance and accounting. This project explores how the U-Net architecture, originally designed for medical imaging, can be adapted to semi-structured documents such as commercial invoices to automatically extract information.'
    },
    methodology: {
      es: '<ul><li>Preprocesamiento de imágenes de facturas (normalización, resize, data augmentation)</li><li>Construcción de la arquitectura U-Net con encoder-decoder y skip connections</li><li>Entrenamiento con datos etiquetados pixel-wise por tipo de campo</li><li>Evaluación con IoU (Intersection over Union) y Dice Coefficient</li><li>Visualización de las máscaras predichas vs. ground truth</li></ul>',
      en: '<ul><li>Invoice image preprocessing (normalization, resize, data augmentation)</li><li>U-Net architecture construction with encoder-decoder and skip connections</li><li>Training on pixel-wise labeled data by field type</li><li>Evaluation with IoU (Intersection over Union) and Dice Coefficient</li><li>Visualization of predicted masks vs. ground truth</li></ul>'
    },
    results: {
      es: 'El modelo logró identificar con precisión los campos clave de las facturas, demostrando la viabilidad de U-Net para documentos semi-estructurados. Las métricas de segmentación alcanzadas superaron la línea base y el modelo mostró buena generalización en el conjunto de validación.',
      en: 'The model successfully identified key invoice fields with high accuracy, demonstrating the viability of U-Net for semi-structured documents. Segmentation metrics surpassed the baseline and the model showed good generalization on the validation set.'
    },
    tags: ['Python', 'TensorFlow', 'U-Net', 'Deep Learning', 'Computer Vision', 'Segmentation'],
    links: [
      { label: 'GitHub', url: 'https://github.com/geramargonzalez/invoicesUNETAnalisis', style: 'outline' },
      { label: 'Colab',  url: 'https://colab.research.google.com/github/geramargonzalez/invoicesUNETAnalisis/blob/main/invoice_field_detection.ipynb', style: 'ghost' }
    ]
  },

  /* ── 3. Posting Job on Upwork ──────────────────────────────── */
  {
    id: 'upwork-jobposting',
    category: 'data-science',
    cover: 'assets/job.png',
    year: '2024',
    title: {
      es: 'Posting Job on Upwork — Predicción de Tarifas Freelance',
      en: 'Posting Job on Upwork — Freelance Rate Prediction'
    },
    subtitle: {
      es: 'Machine Learning · Análisis de Mercado Freelance · UTEC',
      en: 'Machine Learning · Freelance Market Analysis · UTEC'
    },
    description: {
      es: 'En el auge del mercado freelance global, muchos profesionales enfrentan dificultades para establecer tarifas competitivas. Este proyecto desarrolla modelos predictivos para estimar la tarifa horaria promedio en base a habilidades, experiencia y factores del mercado, e identifica qué skills son más valorados por los clientes.',
      en: 'In the boom of the global freelance market, many professionals struggle to set competitive rates. This project develops predictive models to estimate the average hourly rate based on skills, experience and market factors, and identifies which skills are most valued by clients.'
    },
    context: {
      es: 'Proyecto académico que utiliza datos reales de publicaciones en Upwork para construir modelos de predicción de tarifas horarias. El objetivo es ayudar a freelancers a posicionarse competitivamente en el mercado global de tecnología.',
      en: 'Academic project using real Upwork job posting data to build hourly rate prediction models. The goal is to help freelancers position themselves competitively in the global tech market.'
    },
    methodology: {
      es: '<ul><li>Recolección y limpieza de datos de publicaciones de Upwork via API REST</li><li>Feature engineering: extracción de skills, experiencia requerida y presupuesto</li><li>Modelos de regresión: Linear Regression, Random Forest, Gradient Boosting</li><li>Análisis de importancia de variables para identificar skills más valorados</li><li>Validación cruzada y optimización de hiperparámetros</li></ul>',
      en: '<ul><li>Collection and cleaning of Upwork job posting data via REST API</li><li>Feature engineering: extraction of skills, required experience and budget</li><li>Regression models: Linear Regression, Random Forest, Gradient Boosting</li><li>Feature importance analysis to identify the most valued skills</li><li>Cross-validation and hyperparameter optimization</li></ul>'
    },
    results: {
      es: 'Los modelos de Gradient Boosting obtuvieron el mejor desempeño en la predicción de tarifas. El análisis reveló que las habilidades en IA/ML, desarrollo de software especializado y consultoría técnica son las más valoradas. El proyecto entrega insights accionables para freelancers en el mercado tecnológico global.',
      en: 'Gradient Boosting models achieved the best performance in rate prediction. The analysis revealed that AI/ML skills, specialized software development and technical consulting are the most valued. The project provides actionable insights for freelancers in the global tech market.'
    },
    tags: ['Python', 'scikit-learn', 'Pandas', 'Machine Learning', 'Regression', 'REST API'],
    links: [
      { label: 'GitHub', url: 'https://github.com/geramargonzalez/Posting-Job-on-Upwork', style: 'outline' }
    ]
  },

  /* ── 4. Broker Communication Software ─────────────────────── */
  {
    id: 'broker-communication',
    category: 'web',
    cover: null,
    year: '2023',
    title: {
      es: 'Broker Communication Software — Middleware de Mensajería',
      en: 'Broker Communication Software — Messaging Middleware'
    },
    subtitle: {
      es: 'Node.js · TypeScript · Express · REST API · Swagger',
      en: 'Node.js · TypeScript · Express · REST API · Swagger'
    },
    description: {
      es: 'Middleware Express (Node.js / TypeScript) que actúa como punto de integración entre proveedores y sistemas downstream. Recibe payloads de tipo "solicitud", gestiona autenticación, usuarios y datos de perfil, y expone un dashboard operativo y páginas de administración.',
      en: 'Express-based middleware (Node.js / TypeScript) acting as the integration hub between providers and downstream systems. Receives "solicitud" payloads, handles authentication, users and profile data, and exposes an operations dashboard and admin pages.'
    },
    context: {
      es: 'Desarrollado para centralizar la comunicación entre múltiples proveedores externos y sistemas internos. El proyecto surgió de la necesidad de un punto único de integración con autenticación robusta, logging y gestión de perfiles.',
      en: 'Developed to centralize communication between multiple external providers and internal systems. The project arose from the need for a single integration point with robust authentication, logging and profile management.'
    },
    methodology: {
      es: '<ul><li>Diseño de arquitectura con Express.js como punto único de integración</li><li>Servidor JavaScript legado para endpoints de integración y autenticación</li><li>Servicio de perfiles en TypeScript con API RESTful documentada en Swagger / OpenAPI</li><li>Dashboard operativo para visualización de flujo de mensajes</li><li>Gestión de usuarios, autenticación y datos de perfil</li></ul>',
      en: '<ul><li>Architecture design with Express.js as single integration point</li><li>Legacy JavaScript server for integration and authentication endpoints</li><li>TypeScript profile service with RESTful API documented in Swagger / OpenAPI</li><li>Operations dashboard for message flow visualization</li><li>User management, authentication and profile data handling</li></ul>'
    },
    results: {
      es: 'Sistema en producción que procesa solicitudes de múltiples proveedores con alta disponibilidad. La documentación Swagger / OpenAPI facilita la integración de nuevos proveedores. El dashboard operativo brinda visibilidad en tiempo real del flujo de mensajes.',
      en: 'Production system processing requests from multiple providers with high availability. Swagger / OpenAPI documentation facilitates new provider onboarding. The operations dashboard provides real-time visibility into message flow.'
    },
    tags: ['Node.js', 'Express', 'TypeScript', 'REST API', 'Swagger', 'Middleware'],
    links: [
      { label: 'GitHub', url: 'https://github.com/geramargonzalez/broker-communication-software', style: 'outline' }
    ]
  },

  /* ── 5. Fintech CRM Customizations ────────────────────────── */
  {
    id: 'fintech-crm',
    category: 'software',
    cover: null,
    year: '2023',
    title: {
      es: 'Fintech CRM Customizations — SuiteCloud (SDF) para NetSuite',
      en: 'Fintech CRM Customizations — SuiteCloud (SDF) for NetSuite'
    },
    subtitle: {
      es: 'NetSuite · SuiteScript 2.x · SuiteCloud Development Framework · Fintech Uruguay',
      en: 'NetSuite · SuiteScript 2.x · SuiteCloud Development Framework · Uruguayan Fintech'
    },
    description: {
      es: 'Proyecto SuiteCloud (SDF) desarrollado para una fintech uruguaya. Incluye scripts personalizados, objetos y configuraciones de NetSuite para la gestión integral de Leads, integraciones con servicios externos (Clearing, BCU y Web Landing) y mantenimiento de registros.',
      en: 'SuiteCloud (SDF) project developed for a Uruguayan fintech. Contains custom scripts, objects and NetSuite configurations for end-to-end Lead management, integrations with external services (Clearing, BCU and Web Landing), and record maintenance.'
    },
    context: {
      es: 'Una fintech uruguaya necesitaba extender la funcionalidad nativa de NetSuite para gestionar su propio flujo de captación y seguimiento de leads, con integraciones a sistemas externos del mercado financiero uruguayo (BCU, Clearing).',
      en: 'A Uruguayan fintech needed to extend NetSuite\'s native functionality to manage its own lead capture and follow-up flow, with integrations to external systems of the Uruguayan financial market (BCU, Clearing).'
    },
    methodology: {
      es: '<ul><li>Desarrollo siguiendo las prácticas de SuiteCloud Development Framework (SDF)</li><li>Scripts en SuiteScript 2.x: User Event, Scheduled y Map/Reduce</li><li>Integraciones REST con servicios externos (Clearing, BCU, Web Landing)</li><li>Bundles versionados para deployment a sandbox y producción</li><li>Gestión de dependencias mediante manifest.xml</li></ul>',
      en: '<ul><li>Development following SuiteCloud Development Framework (SDF) best practices</li><li>SuiteScript 2.x scripts: User Event, Scheduled and Map/Reduce</li><li>REST integrations with external services (Clearing, BCU, Web Landing)</li><li>Versioned bundles for deployment to sandbox and production</li><li>Dependency management via manifest.xml</li></ul>'
    },
    results: {
      es: 'Solución en producción que automatiza el ciclo completo de captación y calificación de leads con validaciones en tiempo real contra registros del BCU y Clearing. Redujo significativamente el tiempo de procesamiento manual y mejoró la calidad de los datos en NetSuite.',
      en: 'Production solution that automates the complete lead capture and qualification cycle with real-time validations against BCU and Clearing records. Significantly reduced manual processing time and improved data quality in NetSuite.'
    },
    tags: ['NetSuite', 'SuiteCloud', 'SDF', 'SuiteScript 2.x', 'CRM', 'REST API', 'Fintech'],
    links: [
      { label: 'GitHub', url: 'https://github.com/geramargonzalez/FintechCRMCustomizations', style: 'outline' }
    ]
  },

  /* ── 6. Toba — Videojuego Educativo 2D ────────────────────── */
  {
    id: 'toba-videojuego',
    category: 'software',
    cover: 'assets/toba.png',
    year: '2022',
    title: {
      es: 'Toba — Videojuego Educativo 2D',
      en: 'Toba — 2D Educational Video Game'
    },
    subtitle: {
      es: 'Unity · C# · EdTech · Android · Google Play Store',
      en: 'Unity · C# · EdTech · Android · Google Play Store'
    },
    description: {
      es: 'Videojuego 2D diseñado para niños de 9 a 12 años que combina entretenimiento con aprendizaje. Fomenta el cuidado del medio ambiente, la protección de los animales y el desarrollo de habilidades matemáticas. Pensado también como insumo didáctico para docentes. Ya cuenta con una primera versión beta publicada en Google Play Store con 8 niveles de juego.',
      en: '2D video game designed for children aged 9–12 that blends entertainment with learning. It promotes environmental awareness, animal protection and the development of math skills. Also intended as a teaching resource for educators. A first beta version with 8 game levels is already published on Google Play Store.'
    },
    context: {
      es: 'Proyecto personal surgido de la experiencia como docente de programación. Toba nació como respuesta a la falta de recursos lúdicos educativos en español que aborden valores ambientales y habilidades STEM de manera integrada para niños de educación primaria.',
      en: 'Personal project born from experience as a programming teacher. Toba emerged as a response to the lack of Spanish-language educational game resources that address environmental values and STEM skills in an integrated way for primary school children.'
    },
    methodology: {
      es: '<ul><li>Diseño de mecánicas de juego educativas centradas en el usuario (niños 9–12 años)</li><li>Desarrollo en Unity con C# para plataforma Android</li><li>8 niveles con dificultad progresiva y temáticas medioambientales</li><li>Integración de desafíos matemáticos en la dinámica de juego</li><li>Publicación en Google Play Store con proceso de revisión y certificación de Google</li></ul>',
      en: '<ul><li>User-centered educational game mechanics design (children 9–12 years)</li><li>Development in Unity with C# for Android platform</li><li>8 levels with progressive difficulty and environmental themes</li><li>Integration of mathematical challenges into game dynamics</li><li>Publication on Google Play Store with Google review and certification process</li></ul>'
    },
    results: {
      es: 'Primera versión beta disponible en Google Play Store con 8 niveles de juego completos. El juego fue bien recibido en el entorno educativo, siendo utilizado como recurso didáctico por docentes. Se planifica la expansión con nuevos niveles y soporte multiplataforma.',
      en: 'First beta version available on Google Play Store with 8 complete game levels. The game was well received in the educational environment, being used as a teaching resource by educators. Plans include expanding with new levels and cross-platform support.'
    },
    tags: ['Unity', 'C#', '2D Game Dev', 'EdTech', 'Android'],
    links: [
      { label: 'Play Store', url: 'https://play.google.com/store/apps/details?id=com.toba.game', style: 'outline' },
      { label: 'GitHub',     url: 'https://github.com/geramargonzalez/Toba_scripts', style: 'outline' }
    ]
  }

];

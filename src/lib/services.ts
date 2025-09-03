

export type ServiceItem = {
    id: string;
    name: string;
    description: string;
    price: number;
};

export type ServiceCategory = {
    category: string;
    items: ServiceItem[];
};

export const services: ServiceCategory[] = [
    {
        category: "Decoraciones",
        items: [
            { id: "dec-arr-basicos", name: "Arreglos Florales Básicos", description: "Centros de mesa sencillos con flores de temporada.", price: 75 },
            { id: "dec-arr-premium", name: "Arreglos Florales Premium", description: "Diseños florales de lujo con flores importadas.", price: 250 },
            { id: "dec-bouquets", name: "Bouquets Personalizados", description: "Ramos para novias, damas de honor y eventos especiales.", price: 120 },
            { id: "dec-arcos", name: "Arcos Florales", description: "Estructuras decorativas con flores para ceremonias y entradas.", price: 400 },
            { id: "dec-jardines", name: "Diseño de Jardines Temporales", description: "Creación de espacios verdes para el evento.", price: 500 },
            { id: "dec-ilum-basica", name: "Iluminación Ambiental (Básica)", description: "Serie de luces y focos de colores para ambientar.", price: 150 },
            { id: "dec-ilum-arq", name: "Iluminación Arquitectónica", description: "Proyecciones y mapeo de luz en fachadas y estructuras.", price: 600 },
            { id: "dec-candelabros", name: "Candelabros y Velas", description: "Ambientación romántica con velas y candelabros elegantes.", price: 200 },
            { id: "dec-lounge", name: "Mobiliario Lounge", description: "Salas lounge con sofás, sillones y mesas de centro.", price: 350 },
            { id: "dec-sillas", name: "Sillas (Tiffany, Avant Garde)", description: "Alquiler de sillas de diseño por unidad.", price: 5 },
            { id: "dec-mesas", name: "Mesas (Redondas, Rectangulares)", description: "Alquiler de mesas de diferentes estilos por unidad.", price: 15 },
            { id: "dec-draping", name: "Draping Aéreo", description: "Decoración con telas en techos y paredes.", price: 450 },
            { id: "dec-cortinajes", name: "Cortinajes y Fondos", description: "Creación de fondos decorativos para escenarios o photo booths.", price: 300 },
            { id: "dec-manteleria", name: "Caminos de Mesa y Mantelería Fina", description: "Selección de textiles de lujo para mesas.", price: 25 },
            { id: "dec-hielo", name: "Esculturas de Hielo", description: "Diseños personalizados en hielo para un toque de distinción.", price: 550 },
        ],
    },
    {
        category: "Alquileres",
        items: [
            { id: "alq-vaj-std", name: "Vajilla Estándar", description: "Platos, cubiertos y cristalería para cada invitado.", price: 8 },
            { id: "alq-vaj-lux", name: "Vajilla de Lujo", description: "Piezas de diseño y materiales premium.", price: 20 },
            { id: "alq-son-bas", name: "Sistema de Sonido Básico", description: "2 altavoces con consola y micrófono.", price: 250 },
            { id: "alq-son-pro", name: "Sistema de Sonido Concierto", description: "Line array y monitoreo profesional para bandas.", price: 1200 },
            { id: "alq-mic", name: "Micrófonos Inalámbricos (Set)", description: "Set de 2 micrófonos de mano o solapa.", price: 80 },
            { id: "alq-carp-std", name: "Carpas (10x10m)", description: "Carpas estándar para protección contra sol y lluvia.", price: 400 },
            { id: "alq-carp-lux", name: "Carpas de Lujo con Cielo Falso", description: "Carpas elegantes con iluminación y decoración interior.", price: 900 },
            { id: "alq-pista-mad", name: "Pista de Baile de Madera", description: "Módulos de pista de baile de madera (por m²).", price: 20 },
            { id: "alq-pista-led", name: "Pista de Baile Iluminada (LED)", description: "Pista interactiva con luces LED (por m²).", price: 50 },
            { id: "alq-tarimas", name: "Tarimas y Escenarios", description: "Módulos para construir escenarios a medida (por m²).", price: 30 },
            { id: "alq-calefactores", name: "Calefactores de Exterior", description: "Calentadores tipo hongo para áreas frías.", price: 60 },
            { id: "alq-plantas", name: "Plantas Eléctricas", description: "Generadores para asegurar el suministro eléctrico.", price: 300 },
            { id: "alq-pant-led", name: "Pantallas LED (P3)", description: "Pantallas de alta resolución para visuales (por m²).", price: 150 },
            { id: "alq-proyector", name: "Proyectores y Pantallas de Proyección", description: "Equipo para presentaciones y videos.", price: 180 },
            { id: "alq-humo", name: "Máquinas de Humo", description: "Efecto de niebla para pistas de baile y escenarios.", price: 70 },
        ],
    },
    {
        category: "Comida y Bebidas",
        items: [
            { id: "com-menu-3t", name: "Menú de 3 Tiempos (Pollo/Cerdo)", description: "Entrada, plato fuerte y postre. Precio por persona.", price: 45 },
            { id: "com-menu-5t", name: "Menú de 5 Tiempos (Res/Pescado)", description: "Experiencia gastronómica completa. Precio por persona.", price: 70 },
            { id: "com-menu-veg", name: "Menú Vegetariano/Vegano", description: "Opciones gourmet basadas en plantas. Precio por persona.", price: 50 },
            { id: "com-bar-nac", name: "Barra Libre Nacional", description: "Selección de licores y cervezas nacionales. Precio por persona/hora.", price: 15 },
            { id: "com-bar-pre", name: "Barra Libre Premium Internacional", description: "Licores de alta gama y coctelería de autor. Precio por persona/hora.", price: 30 },
            { id: "com-est-tacos", name: "Estación de Tacos al Pastor", description: "Trompo al pastor con todos los complementos. Para 50 personas.", price: 500 },
            { id: "com-est-sushi", name: "Estación de Sushi", description: "Variedad de rollos preparados al momento. Precio por 100 piezas.", price: 300 },
            { id: "com-est-paella", name: "Estación de Paella", description: "Paella gigante cocinada en vivo. Para 50 personas.", price: 700 },
            { id: "com-est-quesos", name: "Mesa de Quesos y Carnes Frías", description: "Selección de productos importados y nacionales. Para 50 personas.", price: 450 },
            { id: "com-post-cla", name: "Mesa de Postres Clásica", description: "Pasteles, cupcakes, galletas y brownies.", price: 350 },
            { id: "com-post-gou", name: "Mesa de Postres Gourmet", description: "Macarons, éclairs, trufas y mini pastelería fina.", price: 550 },
            { id: "com-fuen-choc", name: "Fuente de Chocolate", description: "Con frutas frescas, malvaviscos y otros dippings.", price: 250 },
            { id: "com-canapes", name: "Servicio de Canapés (100 unidades)", description: "Bocadillos salados y dulces para recepción.", price: 200 },
            { id: "com-barista", name: "Barista Profesional (4 horas)", description: "Estación de café de especialidad (espresso, capuccino, etc.).", price: 400 },
            { id: "com-mixologo", name: "Mixólogo para Coctelería de Autor", description: "Creación de cócteles personalizados para el evento.", price: 500 },
        ],
    },
    {
        category: "Música y Entretenimiento",
        items: [
            { id: "mus-dj-pro", name: "DJ Profesional (5 horas)", description: "Música versátil, equipo de sonido e iluminación básica.", price: 600 },
            { id: "mus-dj-vj", name: "DJ con VJ (Video Jockey)", description: "Sincronización de música y videos en pantallas.", price: 900 },
            { id: "mus-jazz", name: "Banda de Jazz (trío)", description: "Música de ambiente para cóctel o cena. Por hora.", price: 450 },
            { id: "mus-rock", name: "Banda de Rock/Pop (5 integrantes)", description: "Show en vivo con los mejores éxitos. Por hora.", price: 800 },
            { id: "mus-salsa", name: "Grupo de Salsa/Cumbia (8 integrantes)", description: "Para poner a bailar a todos los invitados. Por hora.", price: 1000 },
            { id: "mus-mariachi", name: "Mariachi (1 hora)", description: "Tradicional y festivo para momentos especiales.", price: 350 },
            { id: "mus-fotomaton", name: "Fotomatón (3 horas)", description: "Fotos ilimitadas, props divertidos y personalización.", price: 450 },
            { id: "mus-espejo", name: "Espejo Mágico (Magic Mirror)", description: "Fotomatón interactivo de cuerpo completo. 3 horas.", price: 600 },
            { id: "mus-mago", name: "Mago o Ilusionista", description: "Show de magia de cerca o en escenario.", price: 500 },
            { id: "mus-acrobatas", name: "Show de Acróbatas", description: "Espectáculo de acrobacias en tela o aro.", price: 700 },
            { id: "mus-fuego", name: "Bailarines de Fuego (Fire Dancers)", description: "Show impactante para eventos nocturnos.", price: 650 },
            { id: "mus-sax", name: "Saxofonista en Vivo", description: "Acompañamiento musical elegante para recepciones.", price: 300 },
            { id: "mus-piano", name: "Pianista", description: "Música de piano en vivo para cenas o ceremonias.", price: 350 },
            { id: "mus-robot", name: "Robot LED", description: "Animación con un robot con luces LED para la fiesta.", price: 400 },
            { id: "mus-mc", name: "Maestro de Ceremonias", description: "Conductor profesional para guiar el evento.", price: 400 },
        ],
    },
    {
        category: "Catering y Personal",
        items: [
            { id: "per-mesero", name: "Servicio de Meseros (por mesero, 5 horas)", description: "Personal profesional y uniformado.", price: 50 },
            { id: "per-capitan", name: "Capitán de Meseros", description: "Supervisión y coordinación del servicio.", price: 150 },
            { id: "per-bartender", name: "Bartender Profesional (5 horas)", description: "Preparación y servicio de bebidas.", price: 100 },
            { id: "per-cocina", name: "Personal de Cocina (Chef y ayudantes)", description: "Equipo para preparación de alimentos en sitio.", price: 500 },
            { id: "per-limpieza", name: "Personal de Limpieza", description: "Mantienen las áreas limpias durante y después del evento.", price: 40 },
            { id: "per-hostess", name: "Hostess y Recepción (por persona)", description: "Bienvenida y registro de invitados.", price: 45 },
            { id: "per-valet", name: "Valet Parking (por elemento)", description: "Servicio de estacionamiento para invitados.", price: 60 },
            { id: "per-seguridad", name: "Guardia de Seguridad (por elemento)", description: "Vigilancia y control de acceso.", price: 55 },
            { id: "per-planner", name: "Coordinador de Evento (Wedding/Event Planner)", description: "Planificación y ejecución completa del evento.", price: 1500 },
            { id: "per-sommelier", name: "Sommelier", description: "Asesoría y cata de vinos durante la cena.", price: 400 },
            { id: "per-barista", name: "Barista", description: "Especialista en café para una estación dedicada.", price: 120 },
            { id: "per-tecnico", name: "Técnico de Audio/Video", description: "Operador de equipo audiovisual durante el evento.", price: 80 },
            { id: "per-montaje", name: "Montacarguista y Staff de Montaje", description: "Personal para el montaje de estructuras pesadas.", price: 70 },
            { id: "per-paramedico", name: "Paramédico", description: "Asistencia médica básica disponible en el evento.", price: 200 },
        ],
    },
    {
        category: "Lugares de Eventos",
        items: [
            { id: "lug-salon", name: "Salón de Lujo (hasta 200 personas)", description: "Renta de espacio elegante con instalaciones completas.", price: 2500 },
            { id: "lug-hacienda", name: "Hacienda con Jardines (hasta 300 personas)", description: "Espacio rústico y natural para eventos memorables.", price: 4000 },
            { id: "lug-terraza", name: "Terraza con Vista Panorámica", description: "Lugar moderno ideal para cócteles y eventos corporativos.", price: 1800 },
            { id: "lug-loft", name: "Loft Industrial", description: "Espacio versátil para eventos con un toque urbano y moderno.", price: 1500 },
            { id: "lug-jardin", name: "Jardín Botánico", description: "Escenario natural único rodeado de vegetación exótica.", price: 3000 },
            { id: "lug-museo", name: "Museo o Galería de Arte", description: "Un entorno cultural y sofisticado para su evento.", price: 5000 },
            { id: "lug-vinedo", name: "Viñedo", description: "Experiencia campestre y enológica.", price: 3500 },
            { id: "lug-playa", name: "Club de Playa Privado", description: "Evento exclusivo con el mar como telón de fondo.", price: 6000 },
            { id: "lug-rancho", name: "Rancho", description: "Ambiente campirano y espacioso para grandes celebraciones.", price: 2800 },
            { id: "lug-bodega", name: "Bodega Histórica", description: "Un lugar con carácter y encanto del viejo mundo.", price: 2200 },
        ],
    },
     {
        category: "Efectos Especiales y Extras",
        items: [
            { id: "ext-fuegos-bas", name: "Fuegos Artificiales (Paquete Básico)", description: "Show de pirotecnia de 3 minutos.", price: 800 },
            { id: "ext-fuegos-pre", name: "Fuegos Artificiales (Paquete Premium)", description: "Show de pirotecnia de 7 minutos sincronizado con música.", price: 2000 },
            { id: "ext-chisperos", name: "Chisperos de Pirotecnia Fría (4 unidades)", description: "Fuentes de luz para momentos clave, seguras en interiores.", price: 300 },
            { id: "ext-confeti", name: "Cañón de Confeti", description: "Lanzamiento de confeti para celebraciones.", price: 150 },
            { id: "ext-letras", name: "Letras Gigantes Iluminadas (LOVE, etc.)", description: "Letras de 1.5m de altura con luces.", price: 250 },
            { id: "ext-helados", name: "Carrito de Helados o Paletas", description: "Servicio de postres fríos para los invitados.", price: 350 },
            { id: "ext-esquites", name: "Puesto de Esquites y Elotes", description: "Antojitos mexicanos para el cierre de la fiesta.", price: 300 },
            { id: "ext-nineras", name: "Servicio de Niñeras (Babysitting)", description: "Cuidado profesional para los más pequeños.", price: 50 },
            { id: "ext-kit", name: "Kit de Bienvenida para Invitados", description: "Bolsas de regalo personalizadas para los asistentes.", price: 15 },
            { id: "ext-transporte", name: "Transporte para Invitados (Autobús)", description: "Traslado de invitados desde un punto central.", price: 600 },
        ],
    },
];

export const eventos = [
  {
    id: 1,
    titulo: "Noite de Música",
    data: "12 Jul · 20:00",
    local: "Centro Cultural",
    tipo: "Show",
    participants: [
      { id: 1, name: "Ana" },
      { id: 2, name: "Bruno" },
      { id: 3, name: "Carol" },
    ],
    messages: [
      { id: 1, sender: "Você", text: "A banda confirmou o set list?" },
      { id: 2, sender: "Ana", text: "Sim, estamos finalizando os detalhes do som." },
      { id: 3, sender: "Bruno", text: "Vou levar as luzes extras para o palco." },
    ],
    images: [
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1518976024611-488a3b40d54f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
    ],
    playlist: {
      name: "Noite de Música",
      description: "Playlist exclusiva para animar a noite do evento.",
    },
  },
  {
    id: 2,
    titulo: "Coffee Meetup",
    data: "18 Jul · 10:30",
    local: "Café Aurora",
    tipo: "Social",
    participants: [
      { id: 1, name: "Edu" },
      { id: 2, name: "Fabiana" },
      { id: 3, name: "Gabriel" },
    ],
    messages: [
      { id: 1, sender: "Fabiana", text: "Alguém pode trazer mais cadeiras?" },
      { id: 2, sender: "Você", text: "Já reservei mais 5 cadeiras para o mural." },
      { id: 3, sender: "Gabriel", text: "O café especial está confirmado." },
    ],
    images: [
      "https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80",
    ],
    playlist: {
      name: "Coffee Vibes",
      description: "Músicas leves para um encontro social agradável.",
    },
  },
  {
    id: 3,
    titulo: "Workshop de Design",
    data: "21 Jul · 14:00",
    local: "Campus Tech",
    tipo: "Tecnologia",
    participants: [
      { id: 1, name: "Helena" },
      { id: 2, name: "Ivan" },
      { id: 3, name: "Juliana" },
    ],
    messages: [
      { id: 1, sender: "Ivan", text: "Vocês já terminaram o material do workshop?" },
      { id: 2, sender: "Você", text: "Sim, vou subir os slides ainda hoje." },
      { id: 3, sender: "Juliana", text: "Preciso também de um projetor extra." },
    ],
    images: [
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
    ],
    playlist: {
      name: "Design Beats",
      description: "Trilha sonora pensada para inspiração criativa.",
    },
  },
  {
    id: 4,
    titulo: "Piquenique no Parque",
    data: "27 Jul · 16:00",
    local: "Parque da Cidade",
    tipo: "Outdoor",
    participants: [
      { id: 1, name: "Laura" },
      { id: 2, name: "Marcos" },
      { id: 3, name: "Nina" },
    ],
    messages: [
      { id: 1, sender: "Marcos", text: "O tempo está ótimo para piquenique." },
      { id: 2, sender: "Nina", text: "Quantas toalhas vamos precisar?" },
      { id: 3, sender: "Você", text: "Levarei protetor solar e cestas." },
    ],
    images: [
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1521120098177-03ec1d3306f5?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    ],
    playlist: {
      name: "Piquenique Chill",
      description: "Músicas relaxantes para encontro ao ar livre.",
    },
  },
  {
    id: 5,
    titulo: "Game Night",
    data: "02 Ago · 19:30",
    local: "Sala 3",
    tipo: "Entretenimento",
    participants: [
      { id: 1, name: "Otávio" },
      { id: 2, name: "Patrícia" },
      { id: 3, name: "Rafa" },
    ],
    messages: [
      { id: 1, sender: "Patrícia", text: "Eu trouxe novos tabuleiros." },
      { id: 2, sender: "Otávio", text: "Vamos começar com o clássico primeiro." },
      { id: 3, sender: "Você", text: "O snack bar já está pronto." },
    ],
    images: [
      "https://images.unsplash.com/photo-1492447166138-50c3889fccb1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80",
    ],
    playlist: {
      name: "Game Night",
      description: "Músicas energéticas para acompanhar a noite de jogos.",
    },
  },
  {
    id: 6,
    titulo: "Feira de Artesanato",
    data: "05 Ago · 09:00",
    local: "Praça Central",
    tipo: "Cultural",
    participants: [
      { id: 1, name: "Sofia" },
      { id: 2, name: "Tiago" },
      { id: 3, name: "Vera" },
    ],
    messages: [
      { id: 1, sender: "Vera", text: "Já combinei os estandes com todos os expositores." },
      { id: 2, sender: "Tiago", text: "Vou buscar mais mesas dobráveis." },
      { id: 3, sender: "Você", text: "O banner do evento já está pronto." },
    ],
    images: [
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1518183214770-9cffbec72538?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
    ],
    playlist: {
      name: "Artesanato Sound",
      description: "Trilha suave para ambientes criativos de feira.",
    },
  },
];

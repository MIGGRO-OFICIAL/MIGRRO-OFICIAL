
import { ServiceListing, Post, User, Group, AdminStats, AdCampaign, ChatConversation, ServiceRequest } from '../types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Ana Silva',
  avatar: 'https://picsum.photos/seed/ana/200/200',
  location: 'Madrid, ES',
  role: 'admin',
  raizCoins: 150,
  badges: ['Recém-chegada'],
  bio: 'Brasileira em Madrid há 2 meses. Buscando amigos e dicas de visto.',
  isPremium: false,
  joinDate: 'Out 2023',
  trustScore: 30, // Low score, needs verification
  verificationSteps: [
    { type: 'email', status: 'verified', label: 'Email Confirmado', points: 10 },
    { type: 'phone', status: 'verified', label: 'Telefone (SMS)', points: 20 },
    { type: 'document', status: 'unsubmitted', label: 'Documento Oficial', points: 40 },
    { type: 'face', status: 'unsubmitted', label: 'Reconhecimento Facial', points: 30 },
  ],
  reviews: [],
  subscriberCount: 12,
  followingCount: 45,
  wallet: {
      balance: 15.50,
      pendingPayout: 0,
      totalEarnings: 15.50
  }
};

// A "Trusted" Provider
export const TRUSTED_PROVIDER: User = {
  id: 'p4',
  name: 'Elena Vistos & Legal',
  avatar: 'https://picsum.photos/seed/elena/200/200',
  location: 'Barcelona, ES',
  role: 'helper',
  raizCoins: 1200,
  badges: ['Verificado', 'Especialista', 'Top Helper'],
  bio: 'Advogada especializada em imigração. Compartilho dicas diárias sobre regularização na Espanha. Apoie meu conteúdo!',
  isPremium: true,
  joinDate: 'Jan 2023',
  trustScore: 100,
  verificationSteps: [
    { type: 'email', status: 'verified', label: 'Email Confirmado', points: 10 },
    { type: 'phone', status: 'verified', label: 'Telefone (SMS)', points: 20 },
    { type: 'document', status: 'verified', label: 'OAB/Colegiado Validado', points: 40 },
    { type: 'face', status: 'verified', label: 'Biometria Facial', points: 30 },
  ],
  reviews: [
    { id: 'r1', authorId: 'x1', authorName: 'Carlos M.', rating: 5, comment: 'Salvou meu processo de arraigo!', timestamp: '2 dias atrás' },
    { id: 'r2', authorId: 'x2', authorName: 'Julia S.', rating: 5, comment: 'Muito profissional e rápida.', timestamp: '1 semana atrás' }
  ],
  subscriberCount: 1540,
  followingCount: 120,
  wallet: {
      balance: 450.00,
      pendingPayout: 120.00,
      totalEarnings: 3200.00
  }
};

// A "Suspicious" User
export const SUSPICIOUS_USER: User = {
  id: 'bad1',
  name: 'Vendo iPhone Barato',
  avatar: 'https://picsum.photos/seed/scam/200/200',
  location: 'Desconhecido',
  role: 'imigrant',
  raizCoins: 0,
  badges: [],
  bio: 'Chama no zap, não respondo aqui.',
  isPremium: false,
  joinDate: 'Hoje',
  trustScore: 10,
  verificationSteps: [
    { type: 'email', status: 'verified', label: 'Email Confirmado', points: 10 },
    { type: 'phone', status: 'unsubmitted', label: 'Telefone (SMS)', points: 20 },
    { type: 'document', status: 'unsubmitted', label: 'Documento Oficial', points: 40 },
    { type: 'face', status: 'unsubmitted', label: 'Reconhecimento Facial', points: 30 },
  ],
  reviews: [
    { id: 'r3', authorId: 'x3', authorName: 'Admin', rating: 1, comment: 'Possível golpe. Não enviem dinheiro adiantado.', timestamp: '1h atrás' }
  ]
};

export const ADMIN_STATS: AdminStats = {
  totalUsers: 12450,
  activeUsers: 8320,
  mrr: 4250.00,
  adRevenue: 1500.00,
  creatorFund: 750.00, // 50% revenue share
  growthRate: 12.5,
  activeCampaigns: 5,
};

export const AD_CAMPAIGNS: AdCampaign[] = [
  {
    id: 'c1',
    sponsorName: 'Advocacia Madrid Legal',
    title: 'Banner Home - Regularização',
    status: 'active',
    budget: 500,
    spent: 320,
    impressions: 15400,
    clicks: 420,
    startDate: '2023-10-01',
  },
  {
    id: 'c2',
    sponsorName: 'Wise Transfer',
    title: 'Feed Post - Taxa Zero',
    status: 'active',
    budget: 1200,
    spent: 850,
    impressions: 45000,
    clicks: 1250,
    startDate: '2023-09-15',
  },
  {
    id: 'c3',
    sponsorName: 'Mercado Rio',
    title: 'Oferta Picanha',
    status: 'paused',
    budget: 200,
    spent: 45,
    impressions: 1200,
    clicks: 30,
    startDate: '2023-11-01',
  }
];

export const SERVICES: ServiceListing[] = [
  {
    id: 's1',
    providerId: 'p1',
    providerName: 'Carlos Mentoria',
    providerAvatar: 'https://picsum.photos/seed/carlos/200/200',
    title: 'Acompanhamento no TIE/Nie',
    description: 'Vou com você na polícia fazer o seu registro. Evite erros na hora H.',
    category: 'Bureaucracy',
    price: 35,
    currency: 'EUR',
    rating: 4.9,
    reviewsCount: 42,
    verified: true,
  },
  {
    id: 's2',
    providerId: 'p2',
    providerName: 'Mariana Tradutora',
    providerAvatar: 'https://picsum.photos/seed/mari/200/200',
    title: 'Revisão de contrato de aluguel',
    description: 'Não assine nada sem entender. Reviso seu contrato de alquiler para evitar golpes.',
    category: 'Housing',
    price: 50,
    currency: 'RAIZ',
    rating: 5.0,
    reviewsCount: 15,
    verified: true,
  },
  {
    id: 's3',
    providerId: 'p3',
    providerName: 'Grupo Futebol Madri',
    providerAvatar: 'https://picsum.photos/seed/futebol/200/200',
    title: 'Racha de Domingo + Churrasco',
    description: 'Partida amistosa para enturmar. O valor cobre o aluguel do campo.',
    category: 'Social',
    price: 10,
    currency: 'EUR',
    rating: 4.8,
    reviewsCount: 120,
    verified: false,
  },
  {
    id: 's4',
    providerId: 'p4', // Matches Trusted Provider
    providerName: 'Elena Vistos',
    providerAvatar: 'https://picsum.photos/seed/elena/200/200',
    title: 'Consultoria Completa Arraigo',
    description: 'Análise de documentos para Arraigo Social ou Laboral.',
    category: 'Bureaucracy',
    price: 150,
    currency: 'EUR',
    rating: 5.0,
    reviewsCount: 8,
    verified: true,
  },
];

export const GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'Brasileiros em Madrid',
    description: 'O maior grupo da comunidade. Dicas, encontros e avisos gerais.',
    members: 1240,
    image: 'https://picsum.photos/seed/madrid/300/150',
    isPrivate: false,
    safetyRating: 4.5,
    reviewsCount: 120,
  },
  {
    id: 'g2',
    name: 'Mães Imigrantes',
    description: 'Apoio sobre escolas, pediatras e rede de apoio materno.',
    members: 350,
    image: 'https://picsum.photos/seed/moms/300/150',
    isPrivate: true,
    safetyRating: 5.0,
    reviewsCount: 45,
  },
  {
    id: 'g3',
    name: 'Vagas de TI na Espanha',
    description: 'Networking para desenvolvedores e designers brasileiros.',
    members: 890,
    image: 'https://picsum.photos/seed/tech/300/150',
    isPrivate: false,
    safetyRating: 4.2,
    reviewsCount: 30,
  },
];

export const POSTS: Post[] = [
  {
    id: 'post1',
    authorId: 'u2',
    authorName: 'João Pedro',
    authorAvatar: 'https://picsum.photos/seed/joao/200/200',
    content: 'Alguém sabe onde encontrar feijão preto barato aqui no centro de Madrid? A saudade bateu forte hoje! 🥘',
    likes: 24,
    comments: 8,
    timestamp: '2h atrás',
    tags: ['Dicas', 'Comida'],
    type: 'help_request',
  },
  {
    id: 'post2',
    authorId: 'u3',
    authorName: 'Comunidade BR',
    authorAvatar: 'https://picsum.photos/seed/logo/200/200',
    content: 'Encontro mensal de empreendedores brasileiros na próxima quinta-feira! Venha fazer networking.',
    image: 'https://picsum.photos/seed/event/600/300',
    likes: 156,
    comments: 45,
    timestamp: '5h atrás',
    tags: ['Evento', 'Networking'],
    type: 'event',
  },
  {
    id: 'post3',
    authorId: 'p4', // Elena
    authorName: 'Elena Vistos',
    authorAvatar: 'https://picsum.photos/seed/elena/200/200',
    content: 'Gente, saiu uma nova lei sobre a validação de diplomas! Expliquei tudo nesse vídeo rápido. Se precisarem de ajuda, me chamem no privado! 👇',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Example video
    likes: 342,
    comments: 89,
    timestamp: '1d atrás',
    tags: ['Lei', 'Visto', 'Importante'],
    type: 'general',
  }
];

export const MOCK_CHATS: ChatConversation[] = [
    {
        id: 'c1',
        participantId: 'p4', // Elena
        participantName: 'Elena Vistos',
        participantAvatar: 'https://picsum.photos/seed/elena/200/200',
        lastMessage: 'Preciso que envie a cópia do passaporte.',
        lastMessageTime: '10:30',
        unreadCount: 2,
    },
    {
        id: 'c2',
        participantId: 'u2',
        participantName: 'João Pedro',
        participantAvatar: 'https://picsum.photos/seed/joao/200/200',
        lastMessage: 'Combinado! Nos vemos no jogo.',
        lastMessageTime: 'Ontem',
        unreadCount: 0,
    }
];

export const SERVICE_REQUESTS: ServiceRequest[] = [
  {
    id: 'req1',
    authorId: 'u1',
    title: 'Conserto de Janela Basculante',
    description: 'Minha janela do quarto emperrou e não fecha. Está muito frio! Preciso de alguém para consertar hoje.',
    category: 'Housing',
    budget: '50€ - 80€',
    urgency: 'high',
    status: 'open',
    timestamp: '2h atrás',
    proposals: [
      {
        id: 'prop1',
        providerId: 'p5',
        providerName: 'Marido de Aluguel',
        providerAvatar: 'https://picsum.photos/seed/handyman/200/200',
        price: 60,
        currency: 'EUR',
        description: 'Posso ir aí em 1 hora. Tenho ferramentas.',
        timestamp: '15min atrás',
        isUnlocked: false
      },
      {
        id: 'prop2',
        providerId: 'p6',
        providerName: 'Reparos Rápidos (Premium)',
        providerAvatar: 'https://picsum.photos/seed/fix/200/200',
        price: 90,
        currency: 'EUR',
        description: 'Empresa verificada. Damos garantia de 3 meses.',
        timestamp: '1h atrás',
        isUnlocked: true // Premium doesn't lock
      }
    ]
  }
];

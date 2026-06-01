import { User, Profile, Memory, ProfilePhoto } from '../types';

export const DEMO_USER: User = {
  id: 'demo_user_id',
  username: 'João',
  is_admin: false,
  assigned_profile_id: 'demo_profile_id',
  created_at: new Date().toISOString()
};

export const DEMO_PROFILE: Profile = {
  id: 'demo_profile_id',
  name1: 'João',
  name2: 'Maria',
  created_by: 'demo_user_id',
  start_date: '2023-06-12', // Dia dos Namorados no Brasil
  custom_title: 'Nossa eternidade juntos 🌸',
  theme: 'pink',
  image_url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500&auto=format&fit=crop&q=80',
  created_at: new Date().toISOString()
};

export const DEMO_PHOTOS: ProfilePhoto[] = [
  {
    id: 'demo_photo_1',
    user_id: 'demo_user_id',
    profile_id: 'demo_profile_id',
    owner_name: 'João',
    url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=500&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo_photo_2',
    user_id: 'demo_user_id',
    profile_id: 'demo_profile_id',
    owner_name: 'Maria',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo_photo_3',
    user_id: 'demo_user_id',
    profile_id: 'demo_profile_id',
    owner_name: 'João',
    url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=500&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
  },
];

export const DEMO_MEMORIES: Memory[] = [
  {
    id: 'demo_mem_1',
    profile_id: 'demo_profile_id',
    title: 'O Primeiro Beijo na Chuva',
    description: 'Aquele dia de outono no parque municipal, pegamos uma chuva surpresa e acabamos rindo debaixo do coreto. Ali eu soube que era pra sempre.',
    memory_date: '2023-04-15',
    location: 'Parque das Flores, Belo Horizonte',
    image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80',
    tags: ['Especial', 'Passeio', 'Início'],
    is_favorite: true,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo_mem_2',
    profile_id: 'demo_profile_id',
    title: 'Pedido de Namoro Surpresa',
    description: 'Preparei um jantar à luz de velas e fiz o pedido com um bilhete flutuando em um balão de hélio. Ela chorou de emoção e disse SIM com o sorriso mais lindo!',
    memory_date: '2023-06-12',
    location: 'Nossa Varanda',
    image_url: 'https://images.unsplash.com/photo-1464746133101-a2c3f88e0dd9?w=500&auto=format&fit=crop&q=80',
    tags: ['Oficial', 'Jantar', 'Chorinho'],
    is_favorite: true,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo_mem_3',
    profile_id: 'demo_profile_id',
    title: 'Viagem de Fim de Semana',
    description: 'Nossa primeira viagem de carro juntos para a serra. Tomamos fondue perto da lareira e acordamos cedo para ver o nascer do sol sob as nuvens.',
    memory_date: '2024-07-20',
    location: 'Monte Verde, MG',
    image_url: 'https://images.unsplash.com/photo-1475503572774-15a45e5d60b9?w=500&auto=format&fit=crop&q=80',
    tags: ['Viagem', 'Frio', 'Natureza'],
    is_favorite: false,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  }
];

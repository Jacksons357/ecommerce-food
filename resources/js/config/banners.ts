import { bannerImage } from '@/lib/assets';

export interface Banner {
    id: number;
    image: string;
}

export const banners: Banner[] = [
    {
        id: 1,
        image: bannerImage('capa1.png'),
    },
    {
        id: 2,
        image: bannerImage('capa2.png'),
    },
    {
        id: 3,
        image: bannerImage('capa3.png'),
    },
];

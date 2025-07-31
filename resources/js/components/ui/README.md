# Componente Carousel

Um componente de carousel moderno e reutilizável construído com React, Framer Motion e shadcn/ui.

## Características

- **Auto-play**: Muda automaticamente os slides
- **Controles de navegação**: Botões anterior/próximo
- **Indicadores**: Pontos para navegação direta
- **Botão Play/Pause**: Controle do auto-play
- **Pausa no hover**: Para melhor experiência do usuário
- **Animações suaves**: Transições com Framer Motion
- **Responsivo**: Funciona em todos os tamanhos de tela
- **Contador de slides**: Mostra posição atual
- **Conteúdo dinâmico**: Suporte para título, descrição e botão de ação

## Uso

```tsx
import { Carousel } from '@/components/ui/carousel';

const items = [
  {
    id: 1,
    image: '/path/to/image.jpg',
    title: 'Título do Slide',
    description: 'Descrição do slide',
    actionText: 'Ação',
    onAction: () => console.log('Ação executada'),
  },
  // ... mais itens
];

<Carousel
  items={items}
  height="h-96"
  autoPlay={true}
  autoPlayInterval={5000}
  showControls={true}
  showIndicators={true}
  showPlayPause={true}
  className="custom-class"
/>
```

## Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `items` | `CarouselItem[]` | - | Array de itens do carousel |
| `height` | `string` | `"h-96"` | Altura do carousel |
| `autoPlay` | `boolean` | `true` | Habilita auto-play |
| `autoPlayInterval` | `number` | `5000` | Intervalo do auto-play em ms |
| `showControls` | `boolean` | `true` | Mostra botões de navegação |
| `showIndicators` | `boolean` | `true` | Mostra indicadores |
| `showPlayPause` | `boolean` | `true` | Mostra botão play/pause |
| `className` | `string` | - | Classes CSS adicionais |

## Interface CarouselItem

```tsx
interface CarouselItem {
  id: number | string;
  image: string;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}
```

## Estrutura de Arquivos

```
public/
  images/
    banners/
      capa1.png
      capa2.png
      capa3.png

resources/js/
  components/ui/
    carousel.tsx
  config/
    banners.ts
  lib/
    assets.ts
```

## Configuração de Banners

Os banners são configurados no arquivo `resources/js/config/banners.ts`:

```tsx
import { bannerImage } from '@/lib/assets';

export const banners = [
  {
    id: 1,
    image: bannerImage('capa1.png'),
    title: 'Título',
    description: 'Descrição',
    actionText: 'Ação',
    onAction: () => { /* ação */ },
  },
  // ... mais banners
];
```

## Helper de Assets

O helper `bannerImage()` gera URLs corretas para as imagens dos banners:

```tsx
import { bannerImage } from '@/lib/assets';

// Gera: http://localhost:8000/images/banners/capa1.png
const imageUrl = bannerImage('capa1.png');
``` 
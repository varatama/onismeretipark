
export interface Attraction {
  id: string;
  title: string;
  description: string;
  duration: string;
  isLocked: boolean;
  type: 'free' | 'subscription';
}

export const attractions: Attraction[] = [
  {
    id: '1',
    title: 'Hullámvasút a félelmekkel',
    description: 'Nézz szembe a félelmeiddel egy biztonságos, vezetett utazáson.',
    duration: '5–10 perc',
    isLocked: false,
    type: 'free',
  },
  {
    id: '2',
    title: 'Labirintus a döntésekhez',
    description: 'Találd meg a kiutat a hétköznapi dilemmák útvesztőjéből.',
    duration: '10–15 perc',
    isLocked: false,
    type: 'free',
  },
  {
    id: '3',
    title: 'Körkörös tükör',
    description: 'Mély önismereti gyakorlat haladóknak.',
    duration: '20 perc',
    isLocked: true,
    type: 'subscription',
  },
];


'use client'

type AvatarInfo = {
    id: string;
    url: string;
};

// A curated list of avatar styles with direct image URLs
export const allAvatars: AvatarInfo[] = [
  { id: 'prof-1', url: 'https://picsum.photos/seed/prof-1/120/120' },
  { id: 'prof-2', url: 'https://picsum.photos/seed/prof-2/120/120' },
  { id: 'prof-3', url: 'https://picsum.photos/seed/prof-3/120/120' },
  { id: 'prof-4', url: 'https://picsum.photos/seed/prof-4/120/120' },
  { id: 'prof-5', url: 'https://picsum.photos/seed/prof-5/120/120' },
  { id: 'prof-6', url: 'https://picsum.photos/seed/prof-6/120/120' },
  { id: 'cartoon-1', url: 'https://picsum.photos/seed/cartoon-1/120/120' },
  { id: 'cartoon-2', url: 'https://picsum.photos/seed/cartoon-2/120/120' },
  { id: 'cartoon-3', url: 'https://picsum.photos/seed/cartoon-3/120/120' },
  { id: 'cartoon-4', url: 'https://picsum.photos/seed/cartoon-4/120/120' },
  { id: 'cartoon-5', url: 'https://picsum.photos/seed/cartoon-5/120/120' },
  { id: 'cartoon-6', url: 'https://picsum.photos/seed/cartoon-6/120/120' },
  { id: 'animal-1', url: 'https://picsum.photos/seed/animal-1/120/120' },
  { id: 'animal-2', url: 'https://picsum.photos/seed/animal-2/120/120' },
  { id: 'animal-3', url: 'https://picsum.photos/seed/animal-3/120/120' },
  { id: 'animal-4', url: 'https://picsum.photos/seed/animal-4/120/120' },
  { id: 'animal-5', url: 'https://picsum.photos/seed/animal-5/120/120' },
  { id: 'animal-6', url: 'https://picsum.photos/seed/animal-6/120/120' },
];

const avatarMap = new Map(allAvatars.map(a => [a.id, a.url]));

/**
 * Gets the URL for a given avatar ID.
 * @param id The ID of the avatar style (e.g., 'prof-1').
 * @returns The URL of the avatar image. Returns an empty string if the ID is not found.
 */
export const getAvatarUrl = (id?: string | null, name?: string | null): string => {
    if (!id) return '';
    // The name parameter is kept for compatibility but the URL is now static.
    return avatarMap.get(id) || `https://picsum.photos/seed/${id}/120/120`;
};

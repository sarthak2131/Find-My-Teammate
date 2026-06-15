const avatarSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none">
  <rect width="128" height="128" rx="32" fill="#E2E8F0"/>
  <circle cx="64" cy="46" r="22" fill="#94A3B8"/>
  <path d="M28 104c8-15.333 20-23 36-23s28 7.667 36 23" fill="#94A3B8"/>
</svg>`;

const DEFAULT_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg)}`;

const GENERATED_AVATAR_URLS = [
  "",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
];

const createDefaultProfileImage = (seedInput) => {
  const seed = seedInput || Math.floor(100000 + Math.random() * 900000);
  return {
    url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`,
    publicId: "",
  };
};

module.exports = {
  DEFAULT_AVATAR,
  GENERATED_AVATAR_URLS,
  createDefaultProfileImage,
};

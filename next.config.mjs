/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Cho phép gửi ảnh chụp màn hình kèm form (Vercel giới hạn ~4.5 MB mỗi request).
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;

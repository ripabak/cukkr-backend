FROM imbios/bun-node

WORKDIR /app

# Disable Husky during production build to avoid issues with Git hooks in a container environment.
ENV HUSKY=0

COPY package.json bun.lock ./
RUN bun install --production --no-cache

# Drizzle tidak membutuhkan proses "generate" client seperti Prisma.
# Cukup copy folder src dan drizzle (jika perlu menjalankan file migrasi/konfigurasi dsb)
COPY src ./src
COPY drizzle ./drizzle
COPY drizzle.config.ts ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["bun", "src/main.ts"]
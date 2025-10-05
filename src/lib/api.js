export const api = {
  generatePatrolSessions: async ({ sessions=6, size=7 }) => {
    const now = Date.now();
    return Array.from({ length: sessions }, (_, i) => ({
      id: `S${i+1}`,
      houses: Array.from({ length: size }, (_, j) => ({
        id: `H${i+1}-${j+1}`, name: `No ${(i*size)+j+1}`
      })),
      createdAt: now,
      status: "draft",
    }));
  },
};

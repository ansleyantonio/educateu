function generateUserAccountNO(userId: string, createdAt: Date): string {
  // UUID is already unique — XOR-fold all 128 bits into 8 hex chars deterministically
  const hex = userId.replace(/-/g, "");
  const folded = [0, 8, 16, 24].reduce(
    (acc, i) => acc ^ parseInt(hex.slice(i, i + 8), 16),
    0,
  );

  const encodedId = ((folded >>> 0) % 0xffff)
    .toString(16)
    .padStart(4, "0")
    .toUpperCase();
  const mm = String(createdAt.getMonth() + 1).padStart(2, "0");
  const yy = String(createdAt.getFullYear()).slice(-2);

  return `EU-AC-${encodedId}-${mm}${yy}`;
}

export default generateUserAccountNO;

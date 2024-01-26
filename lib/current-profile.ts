import { auth } from "@clerk/nextjs";

import { db } from "@/lib/db";

export const currentProfile = async () => {
  const { userId } = await auth();

  if (!userId) return null;

  return db.profile.findUnique({
    where: {
      userId,
    },
  });
};

import { db } from "@/lib/db";
import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest } from "next";

export const currentProfilePages = async (req: NextApiRequest) => {
  const { userId } = await getAuth(req);

  if (!userId) return null;

  return db.profile.findUnique({
    where: {
      userId,
    },
  });
};

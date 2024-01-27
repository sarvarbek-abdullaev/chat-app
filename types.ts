import { Member, Profile, Server } from "@prisma/client";

export type ServerWithMembersWithRoles = Server & {
  members: (Member & {
    profile: Profile;
  })[];
};

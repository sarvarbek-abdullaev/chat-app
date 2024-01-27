import { FC } from "react";
import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

interface InviteLinkPageProps {
  params: {
    inviteLink: string;
  };
}
const InviteLinkPage: FC<InviteLinkPageProps> = async ({ params }) => {
  const profile = await currentProfile();

  if (!params || !profile) return redirect("/");
  const existingServer = await db.server.findFirst({
    where: {
      inviteLink: params.inviteLink,
      members: {
        some: {
          profileId: profile?.id,
        },
      },
    },
  });
  if (existingServer) return redirect(`/servers/${existingServer.id}`);

  const server = await db.server.update({
    where: {
      inviteLink: params.inviteLink,
    },
    data: {
      members: {
        create: [
          {
            profileId: profile.id,
          },
        ],
      },
    },
  });

  if (server) return redirect(`/servers/${server.id}`);

  return <>Invalid invite link</>;
};

export default InviteLinkPage;

import { FC } from "react";
import { currentProfile } from "@/lib/current-profile";
import { redirectToSignIn } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import ChatHeader from "@/components/chat/chat-header";

interface Props {
  params: {
    serverId: string;
    channelId: string;
  };
}
const Page: FC<Props> = async ({ params }) => {
  const profile = await currentProfile();

  if (!profile) return redirectToSignIn();

  const { serverId, channelId } = params;

  const channel = await db.channel.findUnique({
    where: {
      id: channelId,
    },
  });

  const member = await db.member.findFirst({
    where: {
      serverId,
      profileId: profile.id,
    },
  });

  if (!member || !channel) redirect("/");

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader name={channel.name} serverId={serverId} type="channel" />
    </div>
  );
};

export default Page;

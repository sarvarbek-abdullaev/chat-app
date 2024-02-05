import { FC } from "react";
import { currentProfile } from "@/lib/current-profile";
import { redirectToSignIn } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getOrCreateConversation } from "@/lib/conversation";
import ChatHeader from "@/components/chat/chat-header";
import ChatMessages from "@/components/chat/chat-messages";
import ChatInput from "@/components/chat/chat-input";

interface MemberIdPageProps {
  params: {
    serverId: string;
    memberId: string;
  };
}

const MemberIdPage: FC<MemberIdPageProps> = async ({ params }) => {
  const { serverId, memberId } = params;
  const profile = await currentProfile();

  if (!profile) return redirectToSignIn();

  const currentMember = await db.member.findFirst({
    where: {
      serverId,
      profileId: profile.id,
    },
    include: {
      profile: true,
    },
  });

  if (!currentMember) redirect("/");

  const conversation = await getOrCreateConversation(
    currentMember.id,
    memberId,
  );

  if (!conversation) redirect(`/servers/${serverId}`);

  const { memberOne, memberTwo } = conversation;

  const otherMember = memberOne.id === currentMember.id ? memberTwo : memberOne;

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        imageUrl={otherMember.profile.imageUrl}
        serverId={serverId}
        name={otherMember.profile.name}
        type="conversation"
      />
      <ChatMessages
        member={currentMember}
        name={otherMember.profile.name}
        chatId={conversation.id}
        type="conversation"
        apiUrl="/api/direct-messages"
        paramKey="conversationId"
        paramValue={conversation.id}
        socketUrl="/api/socket/direct-messages"
        socketQuery={{
          conversationId: conversation.id,
        }}
      />
      <ChatInput
        name={otherMember.profile.name}
        type="conversation"
        apiUrl="/api/socket/direct-messages"
        query={{
          conversationId: conversation.id,
        }}
      />
    </div>
  );
};

export default MemberIdPage;

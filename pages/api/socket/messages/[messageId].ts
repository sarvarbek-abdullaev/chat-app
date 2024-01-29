import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "@/types";
import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO,
) {
  //
  if (req.method === "POST" || req.method === "DELETE")
    return res.status(405).json({ message: "Method not allowed" });

  try {
    const profile = await currentProfilePages(req);

    if (!profile) return res.status(401).json({ message: "Unauthorized" });

    const { messageId, serverId, channelId } = req.query;

    if (!messageId)
      return res.status(400).json({ message: "Missing MessageId" });

    if (!serverId) return res.status(400).json({ message: "Missing ServerId" });

    if (!channelId)
      return res.status(400).json({ message: "Missing ChannelId" });

    const { content, fileUrl } = JSON.parse(req.body);

    if (!content && !fileUrl)
      return res.status(400).json({ message: "Missing Content" });

    const server = await db.server.findFirst({
      where: {
        id: serverId as string,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        members: true,
      },
    });

    if (!server) return res.status(404).json({ message: "Server not found" });

    const channel = await db.channel.findFirst({
      where: {
        id: channelId as string,
        serverId: serverId as string,
      },
    });

    if (!channel) return res.status(404).json({ message: "Channel not found" });

    const member = server.members.find(
      (member) => member.profileId === profile.id,
    );

    if (!member) return res.status(401).json({ message: "Member not found" });

    let message = await db.message.findFirst({
      where: {
        id: messageId as string,
        channelId: channelId as string,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!message || message.deleted)
      return res.status(404).json({ message: "Message not found" });

    const isOwner = message.member.profileId === profile.id;
    const isAdmin = member.role === MemberRole.ADMIN;
    const isModerator = member.role === MemberRole.MODERATOR;

    const canModify = isOwner || isAdmin || isModerator;

    if (!canModify) return res.status(401).json({ message: "Unauthorized" });

    if (req.method === "DELETE") {
      message = await db.message.update({
        where: {
          id: messageId as string,
        },
        data: {
          deleted: true,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });

      return res.status(200).json({ message });
    } else if (req.method === "PATCH") {
      if (!isOwner) return res.status(401).json({ message: "Unauthorized" });

      message = await db.message.update({
        where: {
          id: messageId as string,
        },
        data: {
          content,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });

      return res.status(200).json({ message });
    }

    const updateKey = `chat:${channelId}:messages:update`;

    res?.socket?.server?.io?.emit(updateKey, message);

    return res.status(200).json({ message });
  } catch (e) {
    console.log("MESSAGE_ID", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

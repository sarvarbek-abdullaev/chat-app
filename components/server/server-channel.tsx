"use client";

import { Channel, ChannelType, MemberRole, Server } from "@prisma/client";
import { FC } from "react";
import { Edit, Hash, Lock, Mic, Trash, Video } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ActionTooltip } from "@/components/action-tooltip";

interface ServerChannelProps {
  channel: Channel;
  server: Server;
  role?: MemberRole;
}

const iconMap = {
  [ChannelType.TEXT]: Hash,
  [ChannelType.AUDIO]: Mic,
  [ChannelType.VIDEO]: Video,
};

const ServerChannel: FC<ServerChannelProps> = ({ channel, server, role }) => {
  const params = useParams();
  const router = useRouter();
  const Icon = iconMap[channel.type];
  return (
    <button
      className={cn(
        "group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1",
        params.channelId === channel.id && "bg-zinc-700/20 dark:bg-zinc-700",
      )}
    >
      <Icon
        className={cn("w-5 h-5 flex-shrink-0 text-zinc-500 dark:text-zinc-400")}
      />
      <p
        className={cn(
          "text-zinc-500 line-clamp-1 font-semibold dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition",
          params.channelId === channel.id && "text-white dark:text-white",
          params.channelId === channel.id &&
            "text-primary dark:text-zinc-200 group-hover:text-primary dark:group-hover:text-white",
        )}
      >
        {channel.name}
      </p>
      {channel.name !== "general" && role !== MemberRole.GUEST && (
        <div className="ml-auto flex items-center gap-x-2">
          <ActionTooltip label="Edit" side="top">
            <Edit
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/channels/${server.id}/${channel.id}/edit`);
              }}
              className="hidden group-hover:block w-4 h-4 ml-2 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
            />
          </ActionTooltip>
          <ActionTooltip label="Delete" side="top">
            <Trash
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/channels/${server.id}/${channel.id}/edit`);
              }}
              className="hidden group-hover:block w-4 h-4 ml-2 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
            />
          </ActionTooltip>
        </div>
      )}
      {channel.name === "general" && (
        <Lock
          className="ml-auto w-4 h-4 ml-2 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      )}
    </button>
  );
};

export default ServerChannel;

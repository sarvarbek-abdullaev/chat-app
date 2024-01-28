import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";

export async function DELETE(
  req: Request,
  { params }: { params: { channelId: string } },
) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);
    const { channelId } = params;

    if (!profile) return new NextResponse("Unauthorized", { status: 401 });

    const serverId = searchParams.get("serverId");

    if (!serverId)
      return new NextResponse("Server ID Missing", { status: 400 });

    if (!channelId)
      return new NextResponse("Channel ID Missing", { status: 400 });

    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          delete: {
            id: channelId,
            name: {
              not: "general",
            },
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (e) {
    console.log("CHANNEL_DELETE", e);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { channelId: string } },
) {
  try {
    const profile = await currentProfile();

    if (!profile) return new NextResponse("Unauthorized", { status: 401 });

    const { channelId } = params;

    if (!channelId)
      return new NextResponse("Channel ID Missing", { status: 400 });

    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");

    if (!serverId)
      return new NextResponse("Server ID Missing", { status: 400 });

    const { name, type } = await req.json();

    if (name?.toLowerCase() === "general")
      return new NextResponse("Name cannot be 'general'", { status: 400 });

    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          update: {
            where: {
              id: channelId,
              NOT: {
                name: "general",
              },
            },
            data: {
              name,
              type,
            },
          },
        },
      },
    });
    return NextResponse.json(server);
  } catch (error) {
    console.log("CHANNEL_PATCH", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

import { create } from "zustand";
import { generateId } from "@/lib/utils/generators";
import { MOCK_CANAL_MESSAGES } from "../data/canal.mock";
import { CanalMessageWithReactions, CanalReply } from "../types/canal.types";

type CanalStore = {
  messages: CanalMessageWithReactions[];
  replies: CanalReply[];
  recentEmojis: string[];
  isChannelReported: boolean;
  toggleReaction: (messageId: string, emoji: string) => void;
  sendReply: (messageId: string, content: string) => CanalReply;
  reportChannel: () => void;
  pushRecentEmoji: (emoji: string) => void;
};

function applyReactionToggle(
  message: CanalMessageWithReactions,
  emoji: string,
): CanalMessageWithReactions {
  const currentUserReaction = message.reactions.find(
    (reaction) => reaction.userReacted,
  );
  const targetReaction = message.reactions.find(
    (reaction) => reaction.emoji === emoji,
  );

  if (targetReaction) {
    if (targetReaction.userReacted) {
      return {
        ...message,
        reactions: message.reactions
          .map((reaction) =>
            reaction.emoji === emoji
              ? {
                  ...reaction,
                  count: reaction.count - 1,
                  userReacted: false,
                }
              : reaction,
          )
          .filter((reaction) => reaction.count > 0),
      };
    }

    return {
      ...message,
      reactions: message.reactions
        .map((reaction) => {
          if (reaction.emoji === emoji) {
            return {
              ...reaction,
              count: reaction.count + 1,
              userReacted: true,
            };
          }

          if (reaction.userReacted) {
            return {
              ...reaction,
              count: reaction.count - 1,
              userReacted: false,
            };
          }

          return reaction;
        })
        .filter((reaction) => reaction.count > 0),
    };
  }

  if (currentUserReaction) {
    return {
      ...message,
      reactions: [
        ...message.reactions
          .map((reaction) =>
            reaction.userReacted
              ? {
                  ...reaction,
                  count: reaction.count - 1,
                  userReacted: false,
                }
              : reaction,
          )
          .filter((reaction) => reaction.count > 0),
        { emoji, count: 1, userReacted: true },
      ],
    };
  }

  return {
    ...message,
    reactions: [...message.reactions, { emoji, count: 1, userReacted: true }],
  };
}

export const useCanalStore = create<CanalStore>((set, get) => ({
  messages: MOCK_CANAL_MESSAGES,
  replies: [],
  recentEmojis: [],
  isChannelReported: false,

  toggleReaction: (messageId, emoji) => {
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === messageId
          ? applyReactionToggle(message, emoji)
          : message,
      ),
    }));
    get().pushRecentEmoji(emoji);
  },

  sendReply: (messageId, content) => {
    const reply: CanalReply = {
      id: generateId(),
      messageId,
      content: content.trim(),
      sentAt: new Date().toISOString(),
    };

    set((state) => ({
      replies: [...state.replies, reply],
    }));

    return reply;
  },

  reportChannel: () => {
    set({ isChannelReported: true });
  },

  pushRecentEmoji: (emoji) => {
    set((state) => ({
      recentEmojis: [
        emoji,
        ...state.recentEmojis.filter((item) => item !== emoji),
      ].slice(0, 24),
    }));
  },
}));

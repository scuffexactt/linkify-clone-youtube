import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// Get customizations by slug (for public pages)
export const getCustomizationsBySlug = query({
  args: { slug: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("userCustomizations"),
      _creationTime: v.number(),
      userId: v.string(),
      profilePictureStorageId: v.optional(v.id("_storage")),
      profilePictureUrl: v.optional(v.string()),
      description: v.optional(v.string()),
      accentColor: v.optional(v.string()),
    })
  ),
  handler: async ({ db, storage }, args) => {
    const usernameRecord = await db
      .query("usernames")
      .withIndex("by_username", (q) => q.eq("username", args.slug))
      .unique();

    const userId = usernameRecord ? usernameRecord.userId : args.slug;

    const customizations = await db
      .query("userCustomizations")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (!customizations) return null;

    let profilePictureUrl: string | undefined = undefined;
    if (customizations.profilePictureStorageId) {
      profilePictureUrl = await storage.getUrl(customizations.profilePictureStorageId) || undefined;
    }

    return {
      ...customizations,
      profilePictureUrl,
    };
  },
});

// Get current user's customizations (used in dashboard)
export const getUserCustomizations = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("userCustomizations"),
      _creationTime: v.number(),
      userId: v.string(),
      profilePictureStorageId: v.optional(v.id("_storage")),
      profilePictureUrl: v.optional(v.string()),
      description: v.optional(v.string()),
      accentColor: v.optional(v.string()),
    })
  ),
  handler: async ({ db, auth, storage }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const customizations = await db
      .query("userCustomizations")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!customizations) return null;

    let profilePictureUrl: string | undefined = undefined;
    if (customizations.profilePictureStorageId) {
      profilePictureUrl = await storage.getUrl(customizations.profilePictureStorageId) || undefined;
    }

    return {
      ...customizations,
      profilePictureUrl,
    };
  },
});

// Update user customizations
export const updateCustomizations = mutation({
  args: {
    profilePictureStorageId: v.optional(v.id("_storage")),
    description: v.optional(v.string()),
    accentColor: v.optional(v.string()),
  },
  returns: v.id("userCustomizations"),
  handler: async ({ db, auth, storage }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await db
      .query("userCustomizations")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (existing) {
      if (args.profilePictureStorageId && existing.profilePictureStorageId) {
        await storage.delete(existing.profilePictureStorageId);
      }

      await db.patch(existing._id, {
        ...(args.profilePictureStorageId !== undefined && {
          profilePictureStorageId: args.profilePictureStorageId,
        }),
        ...(args.description !== undefined && {
          description: args.description,
        }),
        ...(args.accentColor !== undefined && {
          accentColor: args.accentColor,
        }),
      });

      return existing._id;
    } else {
      return await db.insert("userCustomizations", {
        userId: identity.subject,
        ...(args.profilePictureStorageId !== undefined && {
          profilePictureStorageId: args.profilePictureStorageId,
        }),
        ...(args.description !== undefined && {
          description: args.description,
        }),
        ...(args.accentColor !== undefined && {
          accentColor: args.accentColor,
        }),
      });
    }
  },
});

// Generate upload URL for profile picture
export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async ({ storage, auth }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await storage.generateUploadUrl();
  },
});

// Remove profile picture
export const removeProfilePicture = mutation({
  args: {},
  returns: v.null(),
  handler: async ({ db, auth, storage }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await db
      .query("userCustomizations")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (existing && existing.profilePictureStorageId) {
      await storage.delete(existing.profilePictureStorageId);

      await db.patch(existing._id, {
        profilePictureStorageId: undefined,
      });
    }

    return null;
  },
});

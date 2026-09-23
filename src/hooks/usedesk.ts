import { useCallback, useEffect, useRef, useState } from "react";

import type { Desk, DeskInvite, DeskMember, DeskSubmission } from "../types/desk";

import {
  approveSubmission,
  closeDesk,
  deleteSubmission,
  getDeskForStory,
  getDeskMembers,
  getDeskSubmissions,
  getPendingInvites,
  inviteToDesk,
  respondToInvite,
  submitDeskDraft,
} from "../api/desks";
import { useAuth } from "./useauth";

// ---------------------------------------------------------------------------
// Reader-facing: is there a desk for this story? What"s its state?
// ---------------------------------------------------------------------------
export function useStoryDesk(storyId: string | null) {
  const [desk, setDesk] = useState<Desk | null>(null);
  const [members, setMembers] = useState<DeskMember[]>([]);
  const [loading, setLoading] = useState(true);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    if (!storyId) {
      setDesk(null);
      setMembers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const deskResult = await getDeskForStory(storyId);
    if (!mountedRef.current)
      return;

    if (!deskResult.data) {
      setDesk(null);
      setMembers([]);
      setLoading(false);
      return;
    }

    setDesk(deskResult.data as unknown as Desk);
    const membersResult = await getDeskMembers(deskResult.data.id);
    if (!mountedRef.current)
      return;

    setMembers((membersResult.data ?? []) as unknown as DeskMember[]);
    setLoading(false);
  }, [storyId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { desk, members, loading, refetch };
}

// ---------------------------------------------------------------------------
// Owner-facing: full desk management in Studio
// ---------------------------------------------------------------------------
export function useDeskManagement(deskId: string | null) {
  const { user } = useAuth();

  const [desk, setDesk] = useState<Desk | null>(null);
  const [members, setMembers] = useState<DeskMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<DeskInvite[]>([]);
  const [submissions, setSubmissions] = useState<DeskSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    if (!deskId || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const [membersResult, invitesResult, submissionsResult] = await Promise.all([
      getDeskMembers(deskId),
      getPendingInvites(user.id),
      getDeskSubmissions(deskId),
    ]);

    if (!mountedRef.current)
      return;

    setMembers((membersResult.data ?? []) as unknown as DeskMember[]);
    setPendingInvites(
      (invitesResult.data ?? []).filter(i => i.desk_id === deskId) as unknown as DeskInvite[],
    );
    setSubmissions(
      (submissionsResult.data ?? []) as unknown as DeskSubmission[],
    );
    setLoading(false);
  }, [deskId, user]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------
  const invite = useCallback(
    async (invitedUserId: string, message?: string) => {
      if (!deskId)
        return { error: "No desk" };
      const result = await inviteToDesk(deskId, invitedUserId, message);
      if (result.error)
        return { error: result.error };
      setPendingInvites(prev => [
        result.data as unknown as DeskInvite,
        ...prev,
      ]);
      return { error: null };
    },
    [deskId],
  );

  const revokeInvite = useCallback(async (inviteId: string) => {
    // Optimistic
    setPendingInvites(prev => prev.filter(i => i.id !== inviteId));
    // (you"d call a deleteInvite API — for now just filter locally)
    return { error: null };
  }, []);

  const approve = useCallback(async (submissionId: string) => {
    const result = await approveSubmission(submissionId);
    if (result.error)
      return { error: result.error };
    setSubmissions(prev =>
      prev.map(s =>
        s.id === submissionId
          ? { ...s, is_approved: true, approved_at: new Date().toISOString() }
          : s,
      ),
    );
    return { error: null };
  }, []);

  const remove = useCallback(async (submissionId: string) => {
    const result = await deleteSubmission(submissionId);
    if (result.error)
      return { error: result.error };
    setSubmissions(prev => prev.filter(s => s.id !== submissionId));
    return { error: null };
  }, []);

  const close = useCallback(async () => {
    if (!deskId)
      return { error: "No desk" };
    const result = await closeDesk(deskId);
    if (result.error)
      return { error: result.error };
    setDesk((prev: any) => (prev ? { ...prev, status: "closed" } : prev));
    return { error: null };
  }, [deskId]);

  return {
    desk,
    members,
    pendingInvites,
    submissions,
    loading,
    refetch,
    invite,
    revokeInvite,
    approve,
    remove,
    close,
  };
}

// ---------------------------------------------------------------------------
// Co-writer-facing: submit a draft
// ---------------------------------------------------------------------------
export function useSubmitDraft(deskId: string | null) {
  const submit = useCallback(
    async (chapterNumber: number, title: string, content: string) => {
      if (!deskId)
        return { error: "No desk" };
      const result = await submitDeskDraft({
        desk_id: deskId,
        chapter_number: chapterNumber,
        title,
        content,
      });
      if (result.error)
        return { error: result.error };
      return { error: null, submission: result.data };
    },
    [deskId],
  );

  return { submit };
}

// ---------------------------------------------------------------------------
// Global: pending invites for the current user (banner)
// ---------------------------------------------------------------------------
export function useMyInvites() {
  const { user } = useAuth();
  const [invites, setInvites] = useState<DeskInvite[]>([]);
  const [loading, setLoading] = useState(true);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    if (!user) {
      setInvites([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const result = await getPendingInvites(user.id);
    if (!mountedRef.current)
      return;
    setInvites((result.data ?? []) as unknown as DeskInvite[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const respond = useCallback(
    async (inviteId: string, accept: boolean) => {
      const result = await respondToInvite(inviteId, accept);
      if (result.error)
        return { error: result.error };
      setInvites(prev => prev.filter(i => i.id !== inviteId));
      return { error: null };
    },
    [],
  );

  return { invites, loading, refetch, respond };
}

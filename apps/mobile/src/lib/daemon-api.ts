import type {
  AgentSession,
  BranchSnapshot,
  ComposerDraftChange,
  DaemonSettings,
  Project,
  ProviderKind,
  ProviderProbe,
  ReviewDiffData,
  ReviewDiffSource,
  ResponsePayload,
  HelmClient,
  WorkingTreeEntry,
  WorkspaceResult,
} from '@helm/client';

export type TaskState = Extract<ResponsePayload, { type: 'taskState' }>;
export type DaemonDirectory = Extract<WorkspaceResult, { type: 'directory' }>;

export const daemonKeys = {
  taskState: (profileId: string) => ['daemon', profileId, 'task-state'] as const,
  session: (profileId: string, sessionId: string) => [
    'daemon',
    profileId,
    'session',
    sessionId,
  ] as const,
  settings: (profileId: string) => ['daemon', profileId, 'settings'] as const,
  provider: (profileId: string, provider: ProviderKind) => [
    'daemon',
    profileId,
    'provider',
    provider,
  ] as const,
  directory: (profileId: string, path: string | null) => [
    'daemon',
    profileId,
    'directory',
    path ?? 'home',
  ] as const,
  branches: (profileId: string, cwd: string) => [
    'daemon',
    profileId,
    'branches',
    cwd,
  ] as const,
  workspaceTree: (profileId: string, root: string, expandedPaths: string[]) => [
    'daemon',
    profileId,
    'workspace-tree',
    root,
    expandedPaths,
  ] as const,
  workspaceFile: (profileId: string, root: string, relativePath: string) => [
    'daemon',
    profileId,
    'workspace-file',
    root,
    relativePath,
  ] as const,
  workspaceDiff: (profileId: string, root: string, source: ReviewDiffSource) => [
    'daemon',
    profileId,
    'workspace-diff',
    root,
    source,
  ] as const,
};

export async function loadTaskState(client: HelmClient): Promise<TaskState> {
  return expectResponse(await client.request({ type: 'loadTaskState' }), 'taskState');
}

export async function hydrateSession(
  client: HelmClient,
  sessionId: string,
): Promise<AgentSession | null> {
  const response = expectResponse(
    await client.request({ type: 'hydrateSession', sessionId }),
    'session',
  );
  return response.session;
}

export async function attachDaemonSession(
  client: HelmClient,
  sessionId: string,
): Promise<{ runtimeId: string; supportsSteer: boolean } | null> {
  const response = expectResponse(
    await client.request({ type: 'attachSession' }, sessionId),
    'sessionRuntime',
  );
  return response.runtimeId
    ? { runtimeId: response.runtimeId, supportsSteer: response.supportsSteer }
    : null;
}

export async function loadDaemonSettings(client: HelmClient): Promise<DaemonSettings> {
  const response = expectResponse(await client.request({ type: 'getSettings' }), 'settings');
  return {
    ...response.settings,
    provider_binary_overrides: response.settings.provider_binary_overrides ?? {},
  };
}

export async function probeProvider(
  client: HelmClient,
  provider: ProviderKind,
  settings: DaemonSettings,
  options: { discoverModels?: boolean; probeVersion?: boolean } = {},
): Promise<ProviderProbe & { version: string | null }> {
  const response = expectResponse(
    await client.request({
      type: 'probeProvider',
      provider,
      binaryOverride: settings.provider_binary_overrides?.[provider] ?? null,
      discoverModels: options.discoverModels ?? true,
      probeVersion: options.probeVersion ?? false,
    }),
    'providerProbe',
  );
  return { ...response.probe, version: response.version ?? null };
}

export async function browseDaemonDirectory(
  client: HelmClient,
  path: string | null,
): Promise<DaemonDirectory> {
  const response = expectResponse(
    await client.request({ type: 'workspace', operation: { type: 'browseDirectory', path } }),
    'workspace',
  );
  if (response.result.type !== 'directory') {
    throw new Error('The daemon returned an unexpected directory response');
  }
  return response.result;
}

export function createProject(
  rawPath: string,
  id: string,
  createdAt = Math.floor(Date.now() / 1_000),
): Project {
  const input = rawPath.trim();
  if (!input.startsWith('/') && !/^[a-z]:[\\/]/i.test(input)) {
    throw new Error('Enter an absolute path on the daemon host');
  }
  const path = input === '/' ? input : input.replace(/[\\/]+$/, '');
  const name = path.split(/[\\/]/).filter(Boolean).at(-1) ?? 'Project';
  return { id, name, path, created_at: createdAt };
}

export async function persistProject(
  client: HelmClient,
  candidate: Project,
): Promise<{ project: Project; taskState: TaskState }> {
  const current = await loadTaskState(client);
  const existing = current.projects.find((project) => project.path === candidate.path);
  if (existing) return { project: existing, taskState: current };
  const projects = [...current.projects, candidate];
  expectResponse(
    await client.request({
      type: 'saveTaskState',
      projects,
      liveSessionIds: current.sessions.map((session) => session.id),
      sessions: [],
    }),
    'taskStateSaved',
  );
  return { project: candidate, taskState: { ...current, projects } };
}

export async function createProjectlessWorkspace(client: HelmClient): Promise<string> {
  const response = expectResponse(
    await client.request({
      type: 'workspace',
      operation: { type: 'createProjectlessWorkspace', prompt: null },
    }),
    'workspace',
  );
  if (response.result.type !== 'projectlessWorkspace') {
    throw new Error('The daemon returned an unexpected workspace response');
  }
  return response.result.cwd;
}

export async function materializeWorktree(
  client: HelmClient,
  session: AgentSession,
  projectPath: string,
  prompt: string,
): Promise<AgentSession> {
  if (session.workspace?.kind !== 'newWorktree') return session;
  const response = expectResponse(
    await client.request({
      type: 'workspace',
      operation: {
        type: 'createWorktree',
        project_path: projectPath,
        project_id: session.project_id,
        session_id: session.id,
        prompt,
        base_branch: session.workspace.baseBranch ?? null,
      },
    }),
    'workspace',
  );
  if (response.result.type !== 'worktreeCreated') {
    throw new Error('The daemon returned an unexpected worktree result');
  }
  return {
    ...session,
    workspace: {
      kind: 'worktree',
      path: response.result.worktree.path,
      branch: response.result.worktree.branch,
    },
  };
}

export async function loadComposerDrafts(
  client: HelmClient,
): Promise<Extract<ResponsePayload, { type: 'composerDrafts' }>['drafts']> {
  const response = expectResponse(
    await client.request({ type: 'loadComposerDrafts' }),
    'composerDrafts',
  );
  return response.drafts;
}

export async function applyComposerDraftChanges(
  client: HelmClient,
  changes: ComposerDraftChange[],
): Promise<void> {
  expectResponse(
    await client.request({ type: 'applyComposerDraftChanges', changes }),
    'ack',
  );
}

export async function inspectBranches(
  client: HelmClient,
  cwd: string,
): Promise<BranchSnapshot | null> {
  const response = expectResponse(
    await client.request({ type: 'workspace', operation: { type: 'inspectBranches', cwd } }),
    'workspace',
  );
  if (response.result.type !== 'branches') {
    throw new Error('The daemon returned an unexpected branches response');
  }
  return response.result.snapshot;
}

export async function listWorkspaceTree(
  client: HelmClient,
  root: string,
  expandedPaths: string[],
): Promise<WorkingTreeEntry[]> {
  const response = expectResponse(
    await client.request({
      type: 'workspace',
      operation: { type: 'listTree', root, expanded_paths: expandedPaths },
    }),
    'workspace',
  );
  if (response.result.type !== 'workingTree') {
    throw new Error('The daemon returned an unexpected file tree');
  }
  return response.result.entries;
}

export async function readWorkspaceTextFile(
  client: HelmClient,
  root: string,
  relativePath: string,
): Promise<string> {
  const response = expectResponse(
    await client.request({
      type: 'workspace',
      operation: { type: 'readTextFile', root, relative_path: relativePath },
    }),
    'workspace',
  );
  if (response.result.type !== 'textFile') {
    throw new Error('The daemon returned an unexpected file response');
  }
  return response.result.content;
}

export async function collectWorkspaceDiff(
  client: HelmClient,
  cwd: string,
  source: ReviewDiffSource = 'uncommitted',
): Promise<ReviewDiffData> {
  const response = expectResponse(
    await client.request({
      type: 'workspace',
      operation: { type: 'collectReviewDiff', cwd, source },
    }),
    'workspace',
  );
  if (response.result.type !== 'reviewDiff') {
    throw new Error('The daemon returned an unexpected diff response');
  }
  return response.result.data;
}

export async function removeDaemonSession(
  client: HelmClient,
  sessionId: string,
): Promise<void> {
  expectResponse(await client.request({ type: 'removeSession' }, sessionId), 'ack');
}

export async function persistSession(
  client: HelmClient,
  session: AgentSession,
): Promise<AgentSession> {
  const response = expectResponse(
    await client.request({
      type: 'saveTaskState',
      projects: [],
      liveSessionIds: [session.id],
      sessions: [session],
    }),
    'taskStateSaved',
  );
  return response.sessions.find((item) => item.id === session.id) ?? session;
}

function expectResponse<T extends ResponsePayload['type']>(
  response: ResponsePayload,
  expected: T,
): Extract<ResponsePayload, { type: T }> {
  if (response.type !== expected) {
    throw new Error(`Expected daemon response ${expected}, received ${response.type}`);
  }
  return response as Extract<ResponsePayload, { type: T }>;
}

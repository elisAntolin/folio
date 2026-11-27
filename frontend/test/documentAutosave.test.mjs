import assert from "node:assert/strict";
import { test } from "node:test";
import { ApiError } from "../src/api.ts";
import { DocumentAutosave, waitForDocumentSave } from "../src/editor/documentAutosave.ts";

const doc = (text) => [{ id: "block", type: "paragraph", children: [], content: [{ type: "text", text }] }];
const updatedAt = "2026-11-27T12:00:00";
const settle = async () => { for (let i = 0; i < 24; i++) await Promise.resolve(); };

function setup(t, options = {}) {
  t.mock.timers.enable({ apis: ["setTimeout", "Date"] });
  let remote = options.remote ?? { content: [], version: 1, updatedAt };
  let state;
  let online = options.online ?? true;
  const pageId = options.pageId ?? crypto.randomUUID();
  const drafts = options.drafts ?? new Map();
  const requests = [];
  const io = {
    load: async () => remote,
    save: async (content, version) => {
      requests.push({ version, content });
      if (options.beforeSave) await options.beforeSave();
      if (remote.version !== version) throw new ApiError(409, "Conflito");
      remote = { version: version + 1, content, updatedAt };
      if (options.afterSave) await options.afterSave();
      return remote;
    },
    writeDraft: async (draft) => drafts.set(draft.id, structuredClone(draft)),
    removeDraft: async (draft) => {
      if (drafts.get(draft.id)?.revision === draft.revision) drafts.delete(draft.id);
    },
    online: () => online,
  };
  const saver = new DocumentAutosave("account", pageId, options.offlineStart ? undefined : remote,
    options.recovered, io, (value) => { state = value; });
  saver.start();
  t.after(() => saver.stop());
  return { saver, drafts, requests, state: () => state, pageId, remote: () => remote,
    setRemote: (value) => { remote = value; }, setOnline: (value) => { online = value; },
    tick: async (ms) => { t.mock.timers.tick(ms); await settle(); } };
}

test("debounces edits and skips snapshots already confirmed", async (t) => {
  const f = setup(t);
  f.saver.change([]);
  await f.tick(15_000);
  assert.equal(f.requests.length, 0);
  f.saver.change(doc("a"));
  await f.tick(1_000);
  f.saver.change(doc("ab"));
  await f.tick(1_499);
  assert.equal(f.requests.length, 0);
  await f.tick(1);
  assert.deepEqual(f.requests, [{ content: doc("ab"), version: 1 }]);
  assert.equal(f.drafts.size, 0);
  assert.equal(f.state().status, "saved");
});

test("saves by ten seconds during continuous typing", async (t) => {
  const f = setup(t);
  for (let i = 0; i < 10; i++) {
    f.saver.change(doc(String(i)));
    await f.tick(1_000);
    assert.equal(f.requests.length, i === 9 ? 1 : 0);
  }
  assert.deepEqual(f.remote().content, doc("9"));
});

test("serializes writes and keeps edits made during a request", async (t) => {
  const gate = Promise.withResolvers();
  const f = setup(t, { beforeSave: () => gate.promise });
  f.saver.change(doc("first"));
  void f.saver.flush();
  await settle();
  f.saver.change(doc("newer"));
  void f.saver.flush();
  await f.tick(1_500);
  assert.equal(f.requests.length, 1);
  gate.resolve();
  await settle();
  assert.equal(f.state().status, "unsaved");
  assert.deepEqual([...f.drafts.values()][0].content, doc("newer"));
  await f.tick(0);
  assert.deepEqual(f.requests.map(({ version }) => version), [1, 2]);
  assert.deepEqual(f.remote().content, doc("newer"));
});

test("ignores the old document response after navigation and leaves its newer draft", async (t) => {
  const gate = Promise.withResolvers();
  const f = setup(t, { beforeSave: () => gate.promise });
  f.saver.change(doc("sent"));
  void f.saver.flush();
  await settle();
  f.saver.change(doc("pending"));
  const oldStatus = f.state();
  f.saver.stop();

  const nextStates = [];
  const next = new DocumentAutosave("account", "another-page", { content: [], version: 1, updatedAt },
    undefined, {
      online: () => true,
      load: () => { throw new Error("Unexpected GET"); },
      save: () => { throw new Error("Unexpected PUT"); },
      writeDraft: async () => {},
      removeDraft: async () => {},
    }, (state) => nextStates.push(state.status));
  next.start();

  gate.resolve();
  await waitForDocumentSave("account", f.pageId);
  assert.equal(f.state(), oldStatus);
  assert.deepEqual(nextStates, ["saved"]);
  assert.deepEqual([...f.drafts.values()][0].content, doc("pending"));
  assert.equal([...f.drafts.values()][0].version, 2);
  next.stop();
});

test("recovers an offline draft and synchronizes on reconnect", async (t) => {
  const recovered = { id: "old", userId: "account", pageId: "page", revision: "v1", version: 1,
    content: doc("local"), status: "offline", modifiedAt: 0 };
  const f = setup(t, { recovered, offlineStart: true, online: false,
    pageId: "page", drafts: new Map([["old", recovered]]) });
  await settle();
  assert.equal(f.state().status, "offline");
  assert.equal(f.requests.length, 0);
  f.setOnline(true);
  f.saver.resume();
  await settle();
  assert.deepEqual(f.remote().content, doc("local"));
  assert.equal(f.drafts.size, 0);
});

test("preserves a draft on conflict and saves it only after confirmation", async (t) => {
  const f = setup(t);
  f.saver.change(doc("local"));
  f.setRemote({ content: doc("remote"), version: 2, updatedAt });
  await f.tick(1_500);
  assert.equal(f.state().status, "conflict");
  assert.deepEqual(f.state().server.content, doc("remote"));
  await f.tick(60_000);
  assert.equal(f.requests.length, 1);
  f.saver.keepDraft(f.state().server);
  await settle();
  assert.deepEqual(f.remote().content, doc("local"));
  assert.equal(f.remote().version, 3);
});

test("backs off after temporary failures and reconciles lost responses", async (t) => {
  let attempts = 0;
  const f = setup(t, {
    beforeSave: () => { if (++attempts === 1) throw new ApiError(503, "Temporary"); },
    afterSave: () => { throw new TypeError("Lost response"); },
  });
  f.saver.change(doc("local"));
  await f.tick(1_500);
  assert.equal(f.state().status, "error");
  await f.tick(999);
  assert.equal(f.requests.length, 1);
  await f.tick(1);
  assert.equal(f.requests.length, 2);
  await f.tick(2_000);
  assert.equal(f.requests.length, 2);
  assert.equal(f.state().status, "saved");
  assert.equal(f.drafts.size, 0);
});

test("authorization failures keep the draft and stop automatic retries", async (t) => {
  const f = setup(t, { beforeSave: () => { throw new ApiError(403, "Denied"); } });
  f.saver.change(doc("local"));
  await f.tick(1_500);
  f.saver.resume();
  await f.tick(60_000);
  assert.equal(f.requests.length, 1);
  assert.equal(f.state().status, "error");
  assert.equal(f.drafts.size, 1);
});

test("a recovered draft from an older version waits for a decision", async (t) => {
  const recovered = { id: "old", userId: "account", pageId: "page", revision: "v1", version: 1,
    content: doc("draft"), status: "offline", modifiedAt: 0 };
  const f = setup(t, { recovered, pageId: "page",
    remote: { content: doc("someone else's work"), version: 3, updatedAt } });
  await f.tick(60_000);
  assert.equal(f.requests.length, 0);
  assert.equal(f.state().status, "conflict");
  assert.deepEqual([...f.drafts.values()][0].content, doc("draft"));
});

test("reconciles an acknowledged version after reload, preserving subsequent edits", async (t) => {
  const recovered = { id: "old", userId: "account", pageId: "page", revision: "v2", version: 1,
    content: doc("more edits"), status: "offline", modifiedAt: 0,
    pendingWrite: { version: 1, content: doc("sent before disconnect") } };
  const f = setup(t, { recovered, pageId: "page",
    remote: { content: doc("sent before disconnect"), version: 2, updatedAt } });
  await settle();
  assert.deepEqual(f.requests, [{ version: 2, content: doc("more edits") }]);
  assert.equal(f.state().status, "saved");
});

test("undoing before the debounce clears the pending draft without a PUT", async (t) => {
  const f = setup(t, { remote: { content: doc("original"), version: 1, updatedAt } });
  f.saver.change(doc("edited"));
  f.saver.change(doc("original"));
  await f.tick(10_000);
  assert.equal(f.requests.length, 0);
  assert.equal(f.drafts.size, 0);
  assert.equal(f.state().status, "saved");
});

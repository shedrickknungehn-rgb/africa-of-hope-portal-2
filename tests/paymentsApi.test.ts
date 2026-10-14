import assert from "node:assert/strict";
import { test } from "node:test";
import {
  PAYMENT_PROVIDER_LABELS,
  createPaymentsApi,
  explainPaymentError,
  isValidPaymentPhone,
  isValidTransactionReference,
} from "../src/lib/payments.ts";
import type { PaymentsApiClient } from "../src/lib/payments.ts";

type Response = { data: unknown; error: { message: string; code?: string } | null };

function query(response: Response, calls: Array<[string, ...unknown[]]>) {
  type MockRequest = {
    select: (...args: unknown[]) => MockRequest;
    insert: (...args: unknown[]) => MockRequest;
    update: (...args: unknown[]) => MockRequest;
    delete: (...args: unknown[]) => MockRequest;
    eq: (...args: unknown[]) => MockRequest;
    order: (...args: unknown[]) => MockRequest;
    single: () => Promise<Response>;
    then: (resolve: (value: Response) => unknown, reject: (reason: unknown) => unknown) => Promise<unknown>;
  };
  const request = {} as MockRequest;
  Object.assign(request, {
    select(...args: unknown[]) { calls.push(["select", ...args]); return request; },
    insert(...args: unknown[]) { calls.push(["insert", ...args]); return request; },
    update(...args: unknown[]) { calls.push(["update", ...args]); return request; },
    delete(...args: unknown[]) { calls.push(["delete", ...args]); return request; },
    eq(...args: unknown[]) { calls.push(["eq", ...args]); return request; },
    order(...args: unknown[]) { calls.push(["order", ...args]); return request; },
    single() { calls.push(["single"]); return Promise.resolve(response); },
    then(resolve: (value: Response) => unknown, reject: (reason: unknown) => unknown) {
      return Promise.resolve(response).then(resolve, reject);
    },
  });
  return request;
}

function mockClient(options: { response?: Response; rpcResponse?: Response } = {}) {
  const calls: Array<[string, ...unknown[]]> = [];
  const response = options.response ?? { data: [], error: null };
  const rpcResponse = options.rpcResponse ?? { data: null, error: null };
  const client = {
    from(table: string) { calls.push(["from", table]); return query(response, calls); },
    async rpc(name: string, args: unknown) { calls.push(["rpc", name, args]); return rpcResponse; },
  };
  return { client: client as unknown as PaymentsApiClient, calls };
}

test("provider labels match the mobile money contract", () => {
  assert.equal(PAYMENT_PROVIDER_LABELS.mtn_momo, "MTN MoMo");
  assert.equal(PAYMENT_PROVIDER_LABELS.orange_money, "Orange Money");
});

test("isValidPaymentPhone accepts loosely-formatted Liberian numbers and rejects junk", () => {
  assert.equal(isValidPaymentPhone("+231776679963"), true);
  assert.equal(isValidPaymentPhone("231776679963"), true);
  assert.equal(isValidPaymentPhone("0776679963"), true);
  assert.equal(isValidPaymentPhone("077-667-9963"), true);
  assert.equal(isValidPaymentPhone(""), false);
  assert.equal(isValidPaymentPhone("abc"), false);
  assert.equal(isValidPaymentPhone("12"), false);
});

test("isValidTransactionReference enforces the 4..64 character range", () => {
  assert.equal(isValidTransactionReference("abc"), false);
  assert.equal(isValidTransactionReference("abcd"), true);
  assert.equal(isValidTransactionReference("a".repeat(64)), true);
  assert.equal(isValidTransactionReference("a".repeat(65)), false);
  assert.equal(isValidTransactionReference("  abcd  "), true);
});

test("explainPaymentError translates known RPC error codes into friendly text", () => {
  assert.match(explainPaymentError({ message: "payment_reference_used" }) ?? "", /already been used/);
  assert.match(explainPaymentError({ message: "rejection_note_required" }) ?? "", /note explaining the rejection/);
  assert.match(explainPaymentError({ message: "new row violates row-level security policy" }) ?? "", /permission/);
  assert.match(explainPaymentError({ message: "relation \"payment_channels\" does not exist" }) ?? "", /not set up yet/);
  assert.equal(explainPaymentError(null), null);
});

test("submit() calls submit_payment with the exact contract argument names", async () => {
  const { client, calls } = mockClient({ rpcResponse: { data: "submission-1", error: null } });
  const api = createPaymentsApi(client);
  const id = await api.submit({
    channelId: "chan-1",
    amount: 50,
    currency: "USD",
    category: "Tuition",
    payerPhone: "+231776679963",
    transactionReference: "ABCD1234",
    paidOn: "2026-10-14",
    note: "",
  });
  assert.equal(id, "submission-1");
  assert.deepEqual(calls.filter(([name]) => name === "rpc"), [
    ["rpc", "submit_payment", {
      p_channel_id: "chan-1",
      p_amount: 50,
      p_currency: "USD",
      p_category: "Tuition",
      p_payer_phone: "+231776679963",
      p_transaction_reference: "ABCD1234",
      p_paid_on: "2026-10-14",
      p_note: "",
    }],
  ]);
});

test("submit() validates phone and reference client-side before calling the RPC", async () => {
  const { client, calls } = mockClient();
  const api = createPaymentsApi(client);
  await assert.rejects(
    api.submit({ channelId: "c", amount: 10, currency: "USD", category: "Tuition", payerPhone: "abc", transactionReference: "ABCD", paidOn: "2026-10-14" }),
    /valid mobile money number/,
  );
  await assert.rejects(
    api.submit({ channelId: "c", amount: 10, currency: "USD", category: "Tuition", payerPhone: "0776679963", transactionReference: "ab", paidOn: "2026-10-14" }),
    /transaction ID/,
  );
  assert.ok(!calls.some(([name]) => name === "rpc"));
});

test("submit() translates a duplicate transaction reference into a friendly error", async () => {
  const { client } = mockClient({ rpcResponse: { data: null, error: { message: "payment_reference_used" } } });
  const api = createPaymentsApi(client);
  await assert.rejects(
    api.submit({ channelId: "c", amount: 10, currency: "USD", category: "Tuition", payerPhone: "0776679963", transactionReference: "ABCD1234", paidOn: "2026-10-14" }),
    /already been used/,
  );
});

test("review() calls review_payment with the exact contract argument names", async () => {
  const { client, calls } = mockClient({ rpcResponse: { data: { id: "sub-1", status: "confirmed", receipt_number: "AOH-RCPT-2026-000001" }, error: null } });
  const api = createPaymentsApi(client);
  const result = await api.review("sub-1", "confirm", "");
  assert.equal(result.receipt_number, "AOH-RCPT-2026-000001");
  assert.deepEqual(calls.filter(([name]) => name === "rpc"), [
    ["rpc", "review_payment", { p_submission_id: "sub-1", p_decision: "confirm", p_note: "" }],
  ]);
});

test("review() requires a note for a rejection before calling the RPC", async () => {
  const { client, calls } = mockClient();
  const api = createPaymentsApi(client);
  await assert.rejects(api.review("sub-1", "reject", "   "), /note explaining the rejection/);
  assert.ok(!calls.some(([name]) => name === "rpc"));
  await api.review("sub-1", "reject", "Reference does not match our records.");
  assert.ok(calls.some(([name]) => name === "rpc"));
});

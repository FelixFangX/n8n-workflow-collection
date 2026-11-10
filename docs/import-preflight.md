# Import preflight

`npm run preflight` reads workflow JSON on disk. It does not import the file into n8n, activate it, or send HTTP. The `.redacted.json` export is a payload that would call Lark, OpenAI, Apify, or Bitable if someone imported it and ran it. The preflight command is a finite offline read (`mode: offline-read`, `sends: none`).

There is no quality score. Zero workflow files is a failure.

## Layers

| Layer | What this tool does |
|---|---|
| Structural | Parses the export. Checks node names, `type`, finite `typeVersion`, connection endpoints, `$('Node')` references, reachability from a recognized trigger, `{{UPPER_SNAKE}}` credential ids, and the existing secret-literal rules. |
| n8n runtime | **not-run.** A present numeric `typeVersion` is recorded as compatibility `unknown`. This tool does not know which n8n release loads that node. |
| External correctness | **not-run.** No credential is used and no URL is requested. Classifying a URL path is not proof the API accepts the body. |

`exactlyOnce` is always `not-claimed`. `durability` is `not-configured` unless a future export contains a real dedup store. An in-memory map is not that store, and this tool does not add one.

## Supported structural checks

- Invalid JSON, a missing `nodes` array, duplicate node names.
- Connection source or target that does not name a node.
- `$('Node')` / `$("Node")` text that names a missing node, with the JSON path of the string.
- A node with a known trigger type (`webhook`, `manualTrigger`, `scheduleTrigger`, `chatTrigger`, `formTrigger`, `errorTrigger`) that cannot reach another node: `unreachable-node`.
- Credential `id` missing or not the entire placeholder `{{UPPER_SNAKE}}`. Other secret literals use `scripts/check-redaction.mjs` and are reported by rule and path only.
- HTTP Request nodes with an empty `url`.
- Placeholder names (`{{BITABLE_APP_TOKEN}}` and the rest) listed as import requirements. Listing them does not fill them in.

## Unsupported semantics (left unknown)

- Whether a `type` and `typeVersion` exist in any n8n version, including community nodes such as Apify.
- Whether `active: true` causes the target n8n to activate the workflow on import. The flag is reported as `export-marked-active` and is not acted on.
- Trigger types outside the list above. They produce `trigger-unknown`. Other nodes are not then marked unreachable.
- Expression methods (`={{$json.method}}`). The HTTP class stays `unknown` and is not assumed to be GET.
- Runtime expression results, credential resolution, webhook registration, and error-output routing beyond the literal `connections` object.
- External idempotency of Lark, Bitable, OpenAI, or Apify. `retryOnFail` is reported as `retry-may-repeat-effect` because a retry can repeat a call after an unknown first outcome.
- `onError: continueRegularOutput` on a write. That is `swallowed-write-error`. It is not counted as a successful write.
- Durable dedup. Copying `message_id` through a Code node is not a lookup and is not exactly-once.

## Recovery on the exports in this repo

Recognized event id: webhook body field `message_id`, only when a webhook node exists and the export mentions that field. No other id is inferred.

### Lark requirement bot

`workflows/global/Lark/FeishuBotBitable/feishu-bot-bitable-workflow.redacted.json` (China edition has the same shape).

`message_id` is copied by the Code nodes and used in the Reply URL. No node reads existing Bitable rows by `message_id` before `Create Bitable Record`. A second delivery of the same webhook can create another record. `Create Bitable Record` and `Reply to Lark Message` are separate POSTs. If the record is created and the reply fails, the row remains and the chat can stay unanswered. Replaying the webhook is unverified and can create a second row. The export sets `active` true; this tool does not activate it.

### Social metrics update

`workflows/global/SocialMediaTracker/Update/social-media-effectiveness-tracker.redacted.json`.

Manual trigger, so there is no external event id in the export. Update nodes PUT `/records/{{record id}}`. A repeat addresses that same row when the id is stable. That is not exactly-once: the first PUT's outcome is unknown offline. Apify nodes set `retryOnFail` and `maxTries` 2. A retry can start another actor run and spend quota even if the first run had already succeeded. An actor run and the Bitable PUT can fail independently (`partial-failure-unknown`).

### Per-platform create

The multi-platform Create flow connects each normalize node to `Wait for All Platforms` and then to `Merge All Platform Data`, which feeds `Batch Create Lark Records` (`/records/batch_create`). The per-platform Create exports had the normalize node stop short of `Merge All Platform Data`, so the batch write could not run. Those eight exports now connect the single platform's normalize node directly to `Merge All Platform Data`.

`Batch Create Lark Records` uses `onError: continueRegularOutput`. A failed batch can continue on the success output. Replay dedup of posts is unverified. Creating the table and batch-creating rows are separate irreversible POSTs.

## Exit status

- `1` when any structural finding is an error, or when no workflow export was found.
- `0` when every scanned export has zero structural errors. Warnings remain warnings. `recovery: unverified` with exit 0 is not a production certification (`certification: none`).

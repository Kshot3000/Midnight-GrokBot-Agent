# Hello Studio

Local ZK **prove metrics** panel for `contracts/hello-midnight/hello.compact` (`increment`).

Mirrors Agent Escrow Studio `#local-prove`: load `last-prove.json` from
`npm run prove:hello-local`, or use prove-bridge `:6399`
(`POST /prove?contract=hello`).

**LOCAL prove ≠ on-chain / NOT a Preprod deploy.**

## Serve

```bash
cd apps/hello-studio
python3 -m http.server 5187
# open http://127.0.0.1:5187/#local-prove
```

Hub deep-link (assembled Pages): `/hello/#local-prove`

## Prove + write metrics

```bash
# needs proof-server :6300
npm run prove:hello-local
# writes apps/hello-studio/last-prove.json (+ /tmp)

npm run prove-bridge   # :6399 CORS
# POST http://127.0.0.1:6399/prove?contract=hello
```

## Brand

Donate ADA · [@kshot9000](https://x.com/kshot9000) · Midnight GrokBot Agent

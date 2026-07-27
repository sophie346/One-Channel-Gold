# OneGold (Next.js)

Buy, sell, pawn, and auction gold on one platform.

**Deploy name:** `onechanneladmin-gold`  
**Domain:** [https://gold.onechanneladmin.com](https://gold.onechanneladmin.com)

## Run locally

```bash
pnpm install
pnpm dev
```

App runs at [http://localhost:3000](http://localhost:3000).

## Scripts

- `pnpm dev` — Next.js development server
- `pnpm build` — production build
- `pnpm start` — serve production build

## Stack

- Next.js 15 (App Router)
- Tailwind CSS 4
- Redux Toolkit + Firebase Auth

## Deploy (GCR + GKE + hybrid LB)

Infra lives in the `onechanneladmin-latest` repo (`deploymentsAll/ui/deployment-onechanneladmin-gold.yaml`, `infra/loadbalancer/`).

### 1. Build and push image

From this repo root:

```bash
gcloud builds submit --config=cloudbuild.yaml --project=gentle-epoch-277301 .
```

Image: `gcr.io/gentle-epoch-277301/onechanneladmin-gold:latest`

### 2. Apply Kubernetes Deployment + Service (creates NEG)

In `onechanneladmin-latest`:

```bash
kubectl apply -f deploymentsAll/ui/deployment-onechanneladmin-gold.yaml
kubectl rollout status deployment/onechanneladmin-gold
```

### 3. Wire load balancer

Get the NEG name:

```bash
gcloud compute network-endpoint-groups list \
  --project=gentle-epoch-277301 \
  --zones=us-east1-b \
  --filter='name~onechanneladmin-gold'
```

Put that name into `infra/loadbalancer/terraform.tfvars` under `gke_backend_overrides.onechanneladmin-gold.neg_id` (replace `REPLACE_WITH_NEG_AFTER_K8S_DEPLOY`).

`lb-routing.yaml` already has `gold.onechanneladmin.com` → `gke-onechanneladmin-gold`.

```bash
cd infra/loadbalancer
terraform plan
terraform apply
```

### 4. DNS + HTTPS

Point `gold.onechanneladmin.com` at the hybrid LB IP (`manual-vm-ip` / shared LB). Then refresh the Cloudflare Origin CA bundle:

```bash
cd infra/loadbalancer
./setup-https-bundle.sh
```

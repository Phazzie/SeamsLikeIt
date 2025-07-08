#!/bin/bash
# Deploy to Google Cloud Run

# Configuration
PROJECT_ID="your-gcp-project-id"
REGION="us-central1"
SERVICE_NAME="sdd-mcp-server"
DOMAIN="yourdomain.com"  # Replace with your domain

echo "🚀 Deploying SDD MCP Server to Google Cloud Run"

# 1. Enable required APIs
echo "📦 Enabling APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com

# 2. Create secret for API keys
echo "🔐 Creating secrets..."
echo -n "$OPENAI_API_KEY" | gcloud secrets create openai-api-key --data-file=-
echo -n "$SDD_API_KEY" | gcloud secrets create sdd-api-key --data-file=-

# 3. Build and push container
echo "🏗️ Building container..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# 4. Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production,AI_PROVIDER=openai,AI_MODEL=gpt-4.1-mini-2025-04-14" \
  --set-secrets="OPENAI_API_KEY=openai-api-key:latest,SDD_API_KEY=sdd-api-key:latest" \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --concurrency 100 \
  --port 3000

# 5. Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')
echo "✅ Deployed to: $SERVICE_URL"

# 6. Optional: Map custom domain
echo "🌐 To map your domain ($DOMAIN):"
echo "   1. Go to Cloud Run console"
echo "   2. Click 'Manage Custom Domains'"
echo "   3. Add domain: $DOMAIN"
echo "   4. Update your DNS records as shown"

# 7. Test the deployment
echo "🧪 Testing deployment..."
curl "$SERVICE_URL/health"
# Tapestry AI Data Ingestion

A production-grade data ingestion service for public domain metadata sources. This project fetches and transforms data from various sources using class-based TypeScript modules with proxy readiness and stores a normalized metadata record into AWS RDS (PostgreSQL).

## Features

- **Multiple Ingestion Modules:**  
  Supports sources such as Internet Archive, Creative Commons, Smithsonian, Library of Congress, HathiTrust (on-demand), Project Gutenberg, National Archives, Stanford Renewals, Public Domain Review, Wikimedia Commons, and Public Domain Films.
- **Normalized Database Schema:**  
  Comprehensive, normalized PostgreSQL schema with separate reference tables for sources, media types, licenses, creators, and subjects.
- **Proxy-Ready & Distributed:**  
  Built to run with rotating proxies and scale across multiple machines.
- **AWS Integration:**  
  Deployed on AWS using ECS/Fargate, RDS, CodePipeline, and more for robust CI/CD, auto-scaling, and monitoring.

## Project Structure

```
tapestry-ai-data-ingestion/
├── .env                          # Environment variables
├── package.json                  # NPM configuration and scripts
├── tsconfig.json                 # TypeScript configuration
├── README.md                     # This file
├── deploy/                       # Deployment files (Docker, ECS, CI/CD)
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── aws/
│       ├── ecs-task-def.json
│       └── pipeline.yml
├── src/
│   ├── index.ts                  # Main entry/orchestrator
│   ├── config/                   # Database and AWS configuration
│   │   ├── dbConfig.ts
│   │   └── awsConfig.ts
│   ├── db/
│   │   ├── migrations/           # SQL migrations for schema
│   │   │   ├── 001_create_reference_tables.sql
│   │   │   ├── 002_create_main_tables.sql
│   │   │   └── 003_create_junction_tables.sql
│   │   └── schema.ts             # TypeScript schema definitions
│   ├── utils/                    # Shared utilities (BaseIngestor, ProxyManager, Logger)
│   │   ├── BaseIngestor.ts
│   │   ├── ProxyManager.ts
│   │   └── Logger.ts
│   ├── ingestors/                # Ingestion modules for various sources
│   │   ├── InternetArchiveIngestor.ts
│   │   ├── CreativeCommonsIngestor.ts
│   │   ├── SmithsonianIngestor.ts
│   │   ├── LibraryOfCongressIngestor.ts
│   │   ├── HathiTrustIngestor.ts
│   │   ├── GutenbergIngestor.ts
│   │   ├── NationalArchivesIngestor.ts
│   │   ├── StanfordRenewalsIngestor.ts
│   │   ├── CopyrightOfficeIngestor.ts
│   │   ├── PublicDomainReviewIngestor.ts
│   │   ├── WikimediaCommonsIngestor.ts
│   │   └── PublicDomainFilmsIngestor.ts
│   └── orchestrator.ts           # Central orchestration script
└── .github/
    └── workflows/
        └── ci-cd.yml             # CI/CD configuration
```

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/tapestry-ai-data-ingestion.git
   ```
2. **Install dependencies:**
   ```bash
   cd tapestry-ai-data-ingestion
   npm install
   ```
3. **Set up environment variables:**  
   Create a `.env` file based on the sample provided.
4. **Run the project in development:**
   ```bash
   npm run dev
   ```

## Deployment

- Docker images are built using the Dockerfile in the `deploy/` folder.
- The GitHub Actions pipeline (.github/workflows/ci-cd.yml) handles testing, building, and deploying to AWS ECS/Fargate.
- Refer to the `deploy/aws` folder for ECS Task Definitions and CloudFormation/CodePipeline configurations.

## License

This project is licensed under the MIT License.

# Backend for take-for-help project

Server project built using Typescript/Node.js/Express.js.

## Usage

## Change .env filename:

```bash
> change filename located in root folder of project from .env.example to .env
```

## Install dependencies:

```bash
> yarn
```

## Start docker containers:

```bash
> docker-compose up -d
```

## Create and push the Prisma migration to the database:

```bash
> yarn db:migrate && yarn db:push
```

## Run the development server:

```bash
> yarn start
```

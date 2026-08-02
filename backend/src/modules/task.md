# PDF Management Module — Task Tracker

## Phase 1: Setup & Database
- [x] Install `pdf-lib` in the backend
- [x] Update `backend/prisma/schema.prisma` with `PdfDocument` model
- [x] Run Prisma migration
- [x] Create `uploads` directory in backend for storing files

## Phase 2: Domain Layer
- [x] Create `src/modules/pdf/domain/entities/pdf-document.entity.ts`
- [x] Create `src/modules/pdf/domain/repositories/ipdf-document.repository.ts`

## Phase 3: Application Layer
- [x] Create DTO `src/modules/pdf/application/dto/extract-pages.dto.ts`
- [x] Create interfaces `src/modules/pdf/application/interfaces/pdf-usecase.interface.ts`
- [x] Create interface `src/modules/pdf/application/interfaces/pdf-service.interface.ts`
- [x] Create mapper `src/modules/pdf/application/mappers/pdf-document.mapper.ts`
- [x] Create use cases:
  - [x] `src/modules/pdf/application/use-cases/upload-pdf.usecase.ts`
  - [x] `src/modules/pdf/application/use-cases/get-pdf.usecase.ts`
  - [x] `src/modules/pdf/application/use-cases/get-user-pdfs.usecase.ts`
  - [x] `src/modules/pdf/application/use-cases/extract-pages.usecase.ts`

## Phase 4: Infrastructure Layer
- [x] Create `src/modules/pdf/infrastructure/services/pdf-lib.service.ts`
- [x] Create `src/modules/pdf/infrastructure/database/repositories/prisma-pdf-document.repository.ts`

## Phase 5: Presentation Layer
- [x] Create `src/modules/pdf/presentation/controllers/pdf.controller.ts`
- [x] Create `src/modules/pdf/presentation/pdf.module.ts`

## Phase 6: Wiring & Build Validation
- [x] Wire `PdfModule` in `src/app.module.ts`
- [x] Run typescript type checks and build NestJS backend

## Phase 7: Frontend Integration
- [ ] Implement API endpoints & types in frontend constants/services
- [ ] Build the interactive PDF Drag & Drop page and page selection UI on the dashboard
- [ ] Verify everything compiles and runs correctly

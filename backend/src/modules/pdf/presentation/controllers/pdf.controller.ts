import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  Res,
  UseGuards,
  Inject,
  UseInterceptors,
  UploadedFile,
  StreamableFile,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';

import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from 'src/shared/types/express/authenticated-request.interface';
import { ResponseHelper } from 'src/shared/helpers/response.helper';
import { ExtractPagesDto } from '../../application/dto/extract-pages.dto';

import type {
  IUploadPdfUseCase,
  IGetPdfUseCase,
  IGetUserPdfsUseCase,
  IExtractPagesUseCase,
} from '../../application/interfaces/pdf-usecase.interface';
import type { IStorageService } from '../../application/interfaces/storage-service.interface';

@Controller('pdf')
@UseGuards(JwtAuthGuard)
export class PdfController {
  constructor(
    @Inject('IUploadPdfUseCase')
    private readonly _uploadPdfUseCase: IUploadPdfUseCase,

    @Inject('IGetPdfUseCase')
    private readonly _getPdfUseCase: IGetPdfUseCase,

    @Inject('IGetUserPdfsUseCase')
    private readonly _getUserPdfsUseCase: IGetUserPdfsUseCase,

    @Inject('IExtractPagesUseCase')
    private readonly _extractPagesUseCase: IExtractPagesUseCase,

    @Inject('IStorageService')
    private readonly _storageService: IStorageService,
  ) {}

  // ─── POST /pdf/upload ──────────────────────────────────────────────────────
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: { buffer: Buffer; originalname: string; size: number; mimetype: string },
  ) {
    const result = await this._uploadPdfUseCase.execute(req.user.userId, {
      buffer: file.buffer,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    });

    return ResponseHelper.success(
      {
        id: result.id,
        originalName: result.originalName,
        fileSize: result.fileSize,
        pageCount: result.pageCount,
        isGenerated: result.isGenerated,
        createdAt: result.createdAt,
      },
      'PDF file uploaded successfully',
      HttpStatus.CREATED,
    );
  }

  // ─── GET /pdf ─────────────────────────────────────────────────────────────
  @Get()
  async getMyPdfs(@Req() req: AuthenticatedRequest) {
    const results = await this._getUserPdfsUseCase.execute(req.user.userId);
    const data = results.map((pdf) => ({
      id: pdf.id,
      originalName: pdf.originalName,
      fileSize: pdf.fileSize,
      pageCount: pdf.pageCount,
      isGenerated: pdf.isGenerated,
      createdAt: pdf.createdAt,
    }));

    return ResponseHelper.success(data, 'PDF documents retrieved successfully');
  }

  // ─── GET /pdf/:id ─────────────────────────────────────────────────────────
  @Get(':id')
  async getPdfDetails(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    const pdf = await this._getPdfUseCase.execute(req.user.userId, id);

    return ResponseHelper.success(
      {
        id: pdf.id,
        originalName: pdf.originalName,
        fileSize: pdf.fileSize,
        pageCount: pdf.pageCount,
        isGenerated: pdf.isGenerated,
        createdAt: pdf.createdAt,
      },
      'PDF details retrieved successfully',
    );
  }

  // ─── GET /pdf/:id/download ───────────────────────────────────────────────
  @Get(':id/download')
  async downloadPdf(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const pdf = await this._getPdfUseCase.execute(req.user.userId, id);

    const fileBuffer = await this._storageService.get(pdf.filePath);

    // Ensure the filename always ends with .pdf so browsers treat it correctly
    const downloadFilename = pdf.originalName.endsWith('.pdf')
      ? pdf.originalName
      : `${pdf.originalName}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(downloadFilename)}"`,
    });

    return new StreamableFile(fileBuffer);
  }

  // ─── POST /pdf/:id/extract ────────────────────────────────────────────────
  @Post(':id/extract')
  @HttpCode(HttpStatus.CREATED)
  async extractPages(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: ExtractPagesDto,
  ) {
    const result = await this._extractPagesUseCase.execute(
      req.user.userId,
      id,
      dto.pages,
    );

    return ResponseHelper.success(
      {
        id: result.id,
        originalName: result.originalName,
        fileSize: result.fileSize,
        pageCount: result.pageCount,
        isGenerated: result.isGenerated,
        createdAt: result.createdAt,
      },
      'Pages extracted and new PDF generated successfully',
      HttpStatus.CREATED,
    );
  }
}

import { IsArray, IsInt, Min } from 'class-validator';

export class ExtractPagesDto {
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  pages: number[];
}

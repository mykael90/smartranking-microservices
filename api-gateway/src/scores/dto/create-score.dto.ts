import { IsMongoId, IsNumber } from 'class-validator';

export class CreateScoreDto {
  @IsMongoId()
  game: string;
}

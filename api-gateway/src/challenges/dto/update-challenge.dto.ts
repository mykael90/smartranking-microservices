import { IsEnum, IsOptional } from 'class-validator';
import { ChallengeStatus } from '../challenges-status.enum';

export class UpdateChallengeDto {
  @IsOptional()
  challengeDate: Date;

  @IsOptional()
  @IsEnum(ChallengeStatus)
  status: ChallengeStatus;
}

import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';

export class CreateChallengeDto {
  @IsNotEmpty()
  @IsDateString()
  challengeDate: Date;

  @IsNotEmpty()
  requester: object;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  players: object[];
}

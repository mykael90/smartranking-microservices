import { IsArray, IsNotEmpty } from 'class-validator';

export class AssignGameToChallengeDto {
  @IsNotEmpty()
  def: object;

  @IsArray()
  result: object[];
}

import { IsArray, IsNotEmpty } from 'class-validator';

export class AssignGameToChallengeDto {
  @IsNotEmpty()
  def: string;

  @IsArray()
  result: object[];
}

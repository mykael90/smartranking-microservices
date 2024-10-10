import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    // Pegando o objeto request e adicionando o usuário autenticado a ele
    const request = context.switchToHttp().getRequest();
    request.user = user; // Aqui adicionamos o usuário validado ao objeto request

    return user;
  }
}

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // Recupera as roles exigidas pela rota
      const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );

      if (!requiredRoles) {
        // Se nenhuma role for exigida, acesso é permitido
        return true;
      }

      // Recupera o objeto request e o usuário autenticado
      const request = context.switchToHttp().getRequest();
      const { user } = request;

      // Extrai todas as roles do usuário (considerando múltiplos realms)
      const userRoles = user.realm_access.roles;

      console.log('Roles do usuário:', userRoles);
      console.log('Roles exigidas:', requiredRoles);

      // Verifica se pelo menos uma das roles do usuário está na lista das requiredRoles
      const hasRole = userRoles.some((role) => requiredRoles.includes(role));

      return hasRole;
    } catch (e) {
      console.log('Erro na verificação de roles:', e);
      return false;
    }
  }
}

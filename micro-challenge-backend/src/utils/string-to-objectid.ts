import { Types } from 'mongoose';

// Função para transformar recursivamente strings em ObjectIds
export function transformObjectId(value: any): any {
  if (Array.isArray(value)) {
    return value.map(transformObjectId); // Mapeia para o caso de ser um array
  } else if (value && typeof value === 'object') {
    // Se for um objeto, aplica a transformação em cada chave
    return Object.keys(value).reduce((acc, key) => {
      acc[key] = transformObjectId(value[key]);
      return acc;
    }, {} as any);
  } else if (typeof value === 'string' && Types.ObjectId.isValid(value)) {
    return new Types.ObjectId(value); // Transforma a string em ObjectId
  }
  return value; // Retorna o valor original se não for aplicável
}

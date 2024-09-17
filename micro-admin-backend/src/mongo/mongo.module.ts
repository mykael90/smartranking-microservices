import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategorySchema } from './schemas/category.schema';
import { PlayerSchema } from './schemas/player.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forRoot('mongodb://mongo:27017', {
      dbName: 'sradmbackend',
      auth: {
        username: process.env.MONGO_INITDB_ROOT_USERNAME,
        password: process.env.MONGO_INITDB_ROOT_PASSWORD,
      },
      autoIndex: true,
      autoCreate: true,
      retryAttempts: Infinity,
      retryDelay: 3000,
      connectionFactory: (connection) => {
        connection.on('error', (err: Error) => {
          console.error('Falha ao conectar ao MongoDB:', err.message);
        });

        connection.on('disconnected', () => {
          console.error(
            'Conexão com o MongoDB perdida. Tentando reconectar...',
          );
        });

        connection.on('reconnected', () => {
          console.log('Reconectado ao MongoDB com sucesso.');
        });

        connection.on('connected', () => {
          console.log('Conectado ao MongoDB com sucesso.');
        });
        return connection;
      },
    }),
    MongooseModule.forFeature([
      { name: 'Category', schema: CategorySchema },
      { name: 'Player', schema: PlayerSchema },
    ]),
  ],
  exports: [MongooseModule], // Exporta o MongooseModule para ser usado em outros módulos
})
export class MongoModule {}

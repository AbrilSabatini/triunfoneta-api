import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'reflect-metadata';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3001',
    credentials: true,
  });

  // ─── Swagger ───────────────────────────────────────────────────────────────
  // Solo se expone en entornos no-productivos O si SWAGGER_ENABLED=true.
  const swaggerEnabled =
    process.env.NODE_ENV !== 'production' ||
    process.env.SWAGGER_ENABLED === 'true';

  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('Triunfoneta API')
      .setDescription(
        `**Autenticación:** todos los endpoints protegidos requieren un JWT.\n` +
          `Obtené tu token en \`POST /api/auth/login\` y pegalo en el botón **Authorize**.\n\n`,
      )
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
        'jwt',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true, // el JWT no se borra al recargar
        tagsSorter: 'alpha',
        operationsSorter: 'method',
      },
      customSiteTitle: 'Triunfoneta API Docs',
    });

    console.log(
      `Swagger disponible en http://localhost:${process.env.PORT ?? 3000}/api/docs`,
    );
  }
  // ──────────────────────────────────────────────────────────────────────────

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Triunfoneta API corriendo en http://localhost:${port}/api`);
}

bootstrap();

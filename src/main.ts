import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
        .setTitle('CIP Auth API Doc')
        .setVersion('1.0.0')
        .setDescription('Authentication API')
        .addBearerAuth()

    const document = SwaggerModule.createDocument(app, config.build());
    SwaggerModule.setup('api', app, document)

    await app.listen(3000);

    console.log('   🚀 Server running at http://localhost:3000');
    console.log('   📃 API Doc at http://localhost:3000/api');
}

bootstrap();

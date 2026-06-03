import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

  // CORS 配置：支持 Railway/Vercel 动态域名
  const corsOrigin = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',')
    : ['http://localhost:5173', 'http://localhost:3000']

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  })

  const port = parseInt(process.env.PORT || '3000', 10)
  await app.listen(port, '0.0.0.0')
  console.log(`Server running on port ${port}`)
}
bootstrap()

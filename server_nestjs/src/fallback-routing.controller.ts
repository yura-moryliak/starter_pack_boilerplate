import { Controller, Get, Next, Req, Res } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { join } from 'path';
import * as fs from 'node:fs';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller()
export class FallbackRoutingController {
  @Get('*')
  serveUi(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    const angularDistPath = join(__dirname, '../../', 'dist', 'ui', 'browser');
    const indexHtmlPath = join(angularDistPath, 'index.html');

    if (req.url.startsWith('/api/')) {
      return next();
    }

    if (req.url.startsWith('/uploads/')) {
      return next();
    }

    if (req.url.includes('.')) {
      const filePath = join(angularDistPath, req.url);

      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      } else {
        return res.status(404).json({ message: 'File not found' });
      }
    }

    if (fs.existsSync(indexHtmlPath)) {
      return res.sendFile(indexHtmlPath);
    } else {
      return res.status(404).send('Angular app not found. Run `ng build`.');
    }
  }
}

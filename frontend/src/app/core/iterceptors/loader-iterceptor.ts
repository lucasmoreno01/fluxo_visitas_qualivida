import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { finalize } from 'rxjs';
import { LoaderService } from '../services/loader-service';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  constructor(private loaderService: LoaderService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    this.loaderService.show();

    return next.handle(req).pipe(
      finalize(() => this.loaderService.hide()),
    );
  }
}
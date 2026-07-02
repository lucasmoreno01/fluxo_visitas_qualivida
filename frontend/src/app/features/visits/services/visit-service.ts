import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../core/enviroment';
import { AuthService } from '../../auth/services/auth-service';
import { UpdateVisitStatusDto } from '../dto/update-visit-status.dto';
import { VisitDto, VisitsListResponseDto } from '../dto/visit.dto';

@Injectable({
  providedIn: 'root',
})
export class VisitService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = environment.apiUrl;

  getMyAgenda(date = new Date()): Observable<VisitDto[]> {
    const currentUser = this.authService.getCurrentUser();
    let params = new HttpParams().set('data', this.formatDate(date));

    if (currentUser?.profissionalId) {
      params = params.set('profissionalId', currentUser.profissionalId);
    }

    return this.http
      .get<VisitDto[] | VisitsListResponseDto>(`${this.apiUrl}/visitas`, { params })
      .pipe(
        map((response) => this.extractVisits(response)),
        map((visits) => this.onlyCurrentProfessionalVisits(visits)),
        switchMap((visits) => this.withVisitDetails(visits)),
      );
  }

  getVisitDetails(id: string): Observable<VisitDto> {
    return this.http.get<VisitDto>(`${this.apiUrl}/visitas/${id}`);
  }

  updateStatus(id: string, payload: UpdateVisitStatusDto): Observable<VisitDto> {
    return this.http.patch<VisitDto>(`${this.apiUrl}/visitas/${id}/status`, payload);
  }

  startVisit(id: string): Observable<VisitDto> {
    return this.updateStatus(id, { status: 'EM_ANDAMENTO' });
  }

  finishVisit(id: string, evolucao: UpdateVisitStatusDto['evolucao']): Observable<VisitDto> {
    return this.updateStatus(id, {
      status: 'CONCLUIDA',
      evolucao,
    });
  }

  private extractVisits(response: VisitDto[] | VisitsListResponseDto): VisitDto[] {
    if (Array.isArray(response)) {
      return response;
    }

    return response.data ?? response.items ?? response.visitas ?? [];
  }

  private onlyCurrentProfessionalVisits(visits: VisitDto[]): VisitDto[] {
    const profissionalId = this.authService.getCurrentUser()?.profissionalId;

    if (!profissionalId) {
      return visits;
    }

    return visits.filter((visit) => this.getProfessionalId(visit) === profissionalId);
  }

  private withVisitDetails(visits: VisitDto[]): Observable<VisitDto[]> {
    if (!visits.length) {
      return of([]);
    }

    return forkJoin(
      visits.map((visit) => {
        const visitId = visit.id ?? visit._id;

        if (!visitId || typeof visit.pacienteId !== 'string') {
          return of(visit);
        }

        return this.getVisitDetails(visitId).pipe(catchError(() => of(visit)));
      }),
    );
  }

  private getProfessionalId(visit: VisitDto): string {
    if (typeof visit.profissionalId === 'string') {
      return visit.profissionalId;
    }

    return visit.profissionalId?.id ?? visit.profissionalId?._id ?? '';
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}

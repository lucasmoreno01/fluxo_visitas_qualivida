import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../enviroment';

export interface PatientDto {
  _id?: string;
  id?: string;
  nome: string;
  telefone: string;
  convenio: string;
  endereco: {
    rua: string;
    bairro: string;
    cidade: string;
    cep: string;
  };
  observacoes?: string;
  ativo: boolean;
}

export interface ProfessionalDto {
  _id?: string;
  id?: string;
  usuarioId: {
    _id: string;
    nome: string;
    email: string;
    role: string;
    ativo: boolean;
  };
  tipo: 'ENFERMEIRO' | 'FISIOTERAPEUTA' | 'MEDICO';
  especialidade: string;
  ativo: boolean;
  maxVisitasDia: number;
}

export interface AgendaDoDiaDto {
  visitas: any[];
  vagasRestantes: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdminDataService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // Patients
  getPatients(): Observable<PatientDto[]> {
    return this.http
      .get<PatientDto[] | { items?: PatientDto[]; data?: PatientDto[]; pacientes?: PatientDto[] }>(
        `${this.apiUrl}/pacientes`,
      )
      .pipe(map((response) => this.extractArray(response, 'pacientes')));
  }

  createPatient(patient: Omit<PatientDto, '_id' | 'id'>): Observable<PatientDto> {
    return this.http.post<PatientDto>(`${this.apiUrl}/pacientes`, patient);
  }

  updatePatient(id: string, patient: Partial<PatientDto>): Observable<PatientDto> {
    return this.http.patch<PatientDto>(`${this.apiUrl}/pacientes/${id}`, patient);
  }

  // Users & Professionals
  createUser(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/usuarios`, payload);
  }

  getProfessionals(): Observable<{ items: ProfessionalDto[]; total: number }> {
    return this.http
      .get<
        | ProfessionalDto[]
        | { items?: ProfessionalDto[]; data?: ProfessionalDto[]; profissionais?: ProfessionalDto[]; total?: number }
      >(`${this.apiUrl}/profissionais`)
      .pipe(
        map((response) => ({
          items: this.extractArray(response, 'profissionais'),
          total: Array.isArray(response)
            ? response.length
            : response.total ?? this.extractArray(response, 'profissionais').length,
        })),
      );
  }

  getProfessionalAgenda(id: string, date: string): Observable<any> {
    const params = new HttpParams().set('data', date);
    return this.http.get<any>(`${this.apiUrl}/profissionais/${id}/agenda`, { params });
  }

  // Visitas
  getVisits(filters: {
    data?: string;
    profissionalId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Observable<{ items: any[]; total: number; page: number; limit: number }> {
    let params = new HttpParams();
    if (filters.data) params = params.set('data', filters.data);
    if (filters.profissionalId) params = params.set('profissionalId', filters.profissionalId);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.page) params = params.set('page', String(filters.page));
    if (filters.limit) params = params.set('limit', String(filters.limit));

    return this.http.get<any>(`${this.apiUrl}/visitas`, { params }).pipe(
      map((response) => {
        const items = this.extractArray(response, 'visitas');

        return {
          items,
          total: Array.isArray(response) ? response.length : response.total ?? items.length,
          page: Array.isArray(response) ? filters.page ?? 1 : response.page ?? filters.page ?? 1,
          limit: Array.isArray(response) ? filters.limit ?? items.length : response.limit ?? filters.limit ?? items.length,
        };
      }),
    );
  }

  scheduleVisit(visit: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/visitas`, visit);
  }

  updateVisitStatus(id: string, payload: { status: string; motivoCancelamento?: string }): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/visitas/${id}/status`, payload);
  }

  private extractArray<T>(
    response: T[] | Record<string, unknown>,
    collectionKey: string,
  ): T[] {
    if (Array.isArray(response)) {
      return response;
    }

    const record = response as Record<string, unknown>;
    const value = record['items'] ?? record['data'] ?? record[collectionKey];

    return Array.isArray(value) ? (value as T[]) : [];
  }
}

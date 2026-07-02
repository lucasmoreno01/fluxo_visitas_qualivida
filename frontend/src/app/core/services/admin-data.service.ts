import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
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
    return this.http.get<PatientDto[]>(`${this.apiUrl}/pacientes`);
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
    return this.http.get<{ items: ProfessionalDto[]; total: number }>(`${this.apiUrl}/profissionais`);
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
  }): Observable<any> {
    let params = new HttpParams();
    if (filters.data) params = params.set('data', filters.data);
    if (filters.profissionalId) params = params.set('profissionalId', filters.profissionalId);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.page) params = params.set('page', String(filters.page));
    if (filters.limit) params = params.set('limit', String(filters.limit));

    return this.http.get<any>(`${this.apiUrl}/visitas`, { params });
  }

  scheduleVisit(visit: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/visitas`, visit);
  }

  updateVisitStatus(id: string, payload: { status: string; motivoCancelamento?: string }): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/visitas/${id}/status`, payload);
  }
}

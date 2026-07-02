import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../auth/services/auth-service';
import { EvolutionInputDto } from '../../../visits/dto/update-visit-status.dto';
import { PatientSummaryDto, VisitDto, VisitStatus, VisitType } from '../../../visits/dto/visit.dto';
import { VisitService } from '../../../visits/services/visit-service';
import { UserDto } from '../../../../shared/dto/user.dto';

type AgendaVisit = {
  id: string;
  horario: string;
  paciente: string;
  bairro: string;
  tipo: VisitType;
  status: VisitStatus;
  convenio: string;
  dataHoraInicio: string;
};

@Component({
  selector: 'app-professional-agenda-page',
  imports: [ReactiveFormsModule],
  templateUrl: './professional-agenda-page.html',
  styleUrl: './professional-agenda-page.scss',
})
export class ProfessionalAgendaPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly visitService = inject(VisitService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected selectedVisitId = '';
  protected loading = false;
  protected saving = false;
  protected errorMessage = '';
  protected successMessage = '';
  protected todayLabel = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
  protected currentUser: UserDto | null = null;

  protected visits: AgendaVisit[] = [];

  protected readonly evolutionForm = this.formBuilder.nonNullable.group({
    observacoes: ['', [Validators.required, Validators.minLength(8)]],
    pressao: [''],
    temperatura: [''],
    saturacao: [''],
    frequenciaCardiaca: [''],
    procedimentosRealizados: [''],
    intercorrencias: [''],
    proximaVisitaRecomendada: [''],
  });

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.evolutionForm.disable({ emitEvent: false });
    this.loadAgenda();
  }

  protected get selectedVisit(): AgendaVisit | null {
    return this.visits.find((visit) => visit.id === this.selectedVisitId) ?? this.visits[0] ?? null;
  }

  protected selectVisit(visitId: string) {
    this.selectedVisitId = visitId;
    this.successMessage = '';
    this.errorMessage = '';
    this.updateEvolutionFormState();
  }

  protected canStart(visit: AgendaVisit | null): boolean {
    return Boolean(visit && visit.status === 'CONFIRMADA' && !this.saving);
  }

  protected canFinish(visit: AgendaVisit | null): boolean {
    return Boolean(visit && visit.status === 'EM_ANDAMENTO' && !this.saving);
  }

  protected canEditEvolution(visit: AgendaVisit | null): boolean {
    return Boolean(visit && visit.status === 'EM_ANDAMENTO' && !this.saving);
  }

  protected statusClass(status: VisitStatus): string {
    return status.toLowerCase();
  }

  protected startVisit() {
    const visit = this.selectedVisit;

    if (!visit || !this.canStart(visit)) {
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.updateEvolutionFormState();

    this.visitService
      .startVisit(visit.id)
      .pipe(
        finalize(() => {
          this.saving = false;
          this.updateEvolutionFormState();
        }),
      )
      .subscribe({
        next: (updatedVisit) => {
          this.replaceVisit(updatedVisit);
          this.successMessage = 'Atendimento iniciado.';
        },
        error: (error) => {
          this.errorMessage = this.getErrorMessage(
            error,
            'Nao foi possivel iniciar o atendimento.',
          );
        },
      });
  }

  protected finishVisit() {
    const visit = this.selectedVisit;

    if (!visit || !this.canFinish(visit)) {
      return;
    }

    if (this.evolutionForm.invalid) {
      this.evolutionForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.updateEvolutionFormState();

    this.visitService
      .finishVisit(visit.id, this.buildEvolutionPayload())
      .pipe(
        finalize(() => {
          this.saving = false;
          this.updateEvolutionFormState();
        }),
      )
      .subscribe({
        next: (updatedVisit) => {
          this.replaceVisit(updatedVisit);
          this.evolutionForm.reset();
          this.successMessage = 'Visita concluida com evolucao.';
        },
        error: (error) => {
          this.errorMessage = this.getErrorMessage(
            error,
            'Nao foi possivel finalizar a visita com evolucao.',
          );
        },
      });
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  private loadAgenda(): void {
    this.loading = true;
    this.errorMessage = '';

    this.visitService
      .getMyAgenda()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (visits) => {
          this.visits = visits
            .map((visit) => this.toAgendaVisit(visit))
            .sort((first, second) => first.dataHoraInicio.localeCompare(second.dataHoraInicio));
          this.selectedVisitId = this.visits[0]?.id ?? '';
          this.updateEvolutionFormState();
        },
        error: (error) => {
          this.errorMessage = this.getErrorMessage(
            error,
            'Nao foi possivel carregar sua agenda de hoje.',
          );
        },
      });
  }

  private replaceVisit(updatedVisit: VisitDto): void {
    const previousVisit = this.visits.find(
      (visit) => visit.id === (updatedVisit.id ?? updatedVisit._id),
    );
    const mappedVisit = this.toAgendaVisit(updatedVisit, previousVisit);

    this.visits = this.visits.map((visit) => (visit.id === mappedVisit.id ? mappedVisit : visit));
    this.selectedVisitId = mappedVisit.id;
    this.updateEvolutionFormState();
  }

  private toAgendaVisit(visit: VisitDto, fallback?: AgendaVisit): AgendaVisit {
    const patient = this.getPatient(visit.pacienteId);
    const startDate = new Date(visit.dataHoraInicio);

    return {
      id: visit.id ?? visit._id ?? '',
      horario: startDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      paciente: patient?.nome ?? fallback?.paciente ?? 'Paciente',
      bairro: patient?.endereco?.bairro ?? fallback?.bairro ?? 'Bairro nao informado',
      convenio: patient?.convenio ?? fallback?.convenio ?? 'Convenio nao informado',
      tipo: visit.tipo,
      status: visit.status,
      dataHoraInicio: visit.dataHoraInicio,
    };
  }

  private getPatient(patient: VisitDto['pacienteId']): PatientSummaryDto | null {
    return typeof patient === 'string' ? null : patient;
  }

  private updateEvolutionFormState(): void {
    if (this.canEditEvolution(this.selectedVisit)) {
      this.evolutionForm.enable({ emitEvent: false });
      return;
    }

    this.evolutionForm.disable({ emitEvent: false });
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (
      error &&
      typeof error === 'object' &&
      'error' in error &&
      error.error &&
      typeof error.error === 'object' &&
      'message' in error.error &&
      typeof error.error.message === 'string'
    ) {
      return error.error.message;
    }

    return fallback;
  }

  private buildEvolutionPayload(): EvolutionInputDto {
    const formValue = this.evolutionForm.getRawValue();

    return {
      observacoes: formValue.observacoes,
      sinaisVitais: {
        pressao: formValue.pressao || undefined,
        temperatura: this.toNullableNumber(formValue.temperatura),
        saturacao: this.toNullableNumber(formValue.saturacao),
        frequenciaCardiaca: this.toNullableNumber(formValue.frequenciaCardiaca),
      },
      procedimentosRealizados: formValue.procedimentosRealizados,
      intercorrencias: formValue.intercorrencias,
      proximaVisitaRecomendada: formValue.proximaVisitaRecomendada || null,
    };
  }

  private toNullableNumber(value: string): number | null {
    if (!value) {
      return null;
    }

    const numberValue = Number(value);
    return Number.isNaN(numberValue) ? null : numberValue;
  }
}

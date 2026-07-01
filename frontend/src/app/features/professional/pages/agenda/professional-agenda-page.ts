import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

type VisitStatus = 'CONFIRMADA' | 'EM_ANDAMENTO' | 'CONCLUIDA';

type AgendaVisit = {
  id: string;
  horario: string;
  paciente: string;
  bairro: string;
  tipo: string;
  status: VisitStatus;
  convenio: string;
};

@Component({
  selector: 'app-professional-agenda-page',
  imports: [ReactiveFormsModule],
  templateUrl: './professional-agenda-page.html',
  styleUrl: './professional-agenda-page.scss',
})
export class ProfessionalAgendaPage {
  protected selectedVisitId = 'v1';

  protected readonly visits: AgendaVisit[] = [
    {
      id: 'v1',
      horario: '08:00',
      paciente: 'Maria de Lourdes Santos',
      bairro: 'Pituba',
      tipo: 'CURATIVO',
      status: 'CONFIRMADA',
      convenio: 'QualiSaude',
    },
    {
      id: 'v2',
      horario: '10:00',
      paciente: 'Jose Carlos Oliveira',
      bairro: 'Barra',
      tipo: 'MEDICACAO',
      status: 'EM_ANDAMENTO',
      convenio: 'VidaPlus',
    },
    {
      id: 'v3',
      horario: '14:00',
      paciente: 'Helena Costa',
      bairro: 'Brotas',
      tipo: 'CURATIVO',
      status: 'CONCLUIDA',
      convenio: 'SaudeLar',
    },
  ];

  protected readonly evolutionForm = new FormBuilder().nonNullable.group({
    observacoes: ['', [Validators.required, Validators.minLength(8)]],
    pressao: [''],
    temperatura: [''],
    saturacao: [''],
    frequenciaCardiaca: [''],
    procedimentosRealizados: [''],
    intercorrencias: [''],
    proximaVisitaRecomendada: [''],
  });

  protected get selectedVisit(): AgendaVisit {
    return this.visits.find((visit) => visit.id === this.selectedVisitId) ?? this.visits[0];
  }

  protected selectVisit(visitId: string) {
    this.selectedVisitId = visitId;
  }

  protected canStart(visit: AgendaVisit): boolean {
    return visit.status === 'CONFIRMADA';
  }

  protected canFinish(visit: AgendaVisit): boolean {
    return visit.status === 'EM_ANDAMENTO';
  }

  protected startVisit() {
    this.selectedVisit.status = 'EM_ANDAMENTO';
  }

  protected finishVisit() {
    if (this.evolutionForm.invalid) {
      this.evolutionForm.markAllAsTouched();
      return;
    }

    this.selectedVisit.status = 'CONCLUIDA';
    this.evolutionForm.reset();
  }
}

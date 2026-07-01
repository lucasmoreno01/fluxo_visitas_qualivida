import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-visits-page',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-visits-page.html',
  styleUrl: './admin-visits-page.scss',
})
export class AdminVisitsPage {
  protected readonly filtersForm = new FormBuilder().nonNullable.group({
    data: [''],
    profissionalId: [''],
    status: [''],
  });

  protected readonly scheduleForm = new FormBuilder().nonNullable.group({
    pacienteId: ['', Validators.required],
    profissionalId: ['', Validators.required],
    tipo: ['AVALIACAO', Validators.required],
    dataHoraInicio: ['', Validators.required],
  });

  protected readonly visits = [
    {
      horario: '08:00',
      paciente: 'Maria de Lourdes Santos',
      profissional: 'Ana Souza',
      tipo: 'CURATIVO',
      status: 'CONFIRMADA',
      bairro: 'Pituba',
    },
    {
      horario: '09:00',
      paciente: 'Roberto Lima',
      profissional: 'Bruno Almeida',
      tipo: 'FISIOTERAPIA',
      status: 'CONFIRMADA',
      bairro: 'Ondina',
    },
    {
      horario: '15:30',
      paciente: 'Maria de Lourdes Santos',
      profissional: 'Carla Mendes',
      tipo: 'AVALIACAO',
      status: 'CONCLUIDA',
      bairro: 'Pituba',
    },
  ];

  protected readonly professionals = [
    'Ana Souza · Enfermeira',
    'Bruno Almeida · Fisioterapeuta',
    'Carla Mendes · Medica',
  ];
}

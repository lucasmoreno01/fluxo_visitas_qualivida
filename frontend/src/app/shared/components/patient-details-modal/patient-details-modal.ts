import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PatientDetailsDto } from '../../dto/patient.dto';

@Component({
  selector: 'app-patient-details-modal',
  imports: [],
  templateUrl: './patient-details-modal.html',
  styleUrl: './patient-details-modal.scss',
})
export class PatientDetailsModalComponent {
  @Input({ required: true }) patient!: PatientDetailsDto;
  @Output() closed = new EventEmitter<void>();

  protected close(): void {
    this.closed.emit();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  protected formatAddress(): string {
    const endereco = this.patient.endereco;

    if (!endereco) {
      return 'Nao informado';
    }

    const parts = [
      endereco.rua,
      endereco.bairro,
      endereco.cidade,
      endereco.cep,
    ].filter(Boolean);

    return parts.length ? parts.join(' · ') : 'Nao informado';
  }
}

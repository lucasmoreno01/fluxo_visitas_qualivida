import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import {
  AdminDataService,
  PatientDto,
  ProfessionalDto,
} from '../../../../core/services/admin-data.service';
import { PatientDetailsModalComponent } from '../../../../shared/components/patient-details-modal/patient-details-modal';
import { InputMaskDirective } from '../../../../shared/directives/input-mask.directive';
import { MASK_CEP, MASK_PHONE_BR } from '../../../../shared/directives/input-masks';
import { PatientDetailsDto } from '../../../../shared/dto/patient.dto';
import { AuthService } from '../../../auth/services/auth-service';

@Component({
  selector: 'app-admin-visits-page',
  imports: [ReactiveFormsModule, FormsModule, InputMaskDirective, PatientDetailsModalComponent],
  templateUrl: './admin-visits-page.html',
  styleUrl: './admin-visits-page.scss',
})
export class AdminVisitsPage implements OnInit {
  protected readonly maskPhone = MASK_PHONE_BR;
  protected readonly maskCep = MASK_CEP;

  private readonly autoHideDelayMs = 5000;
  private feedbackTimeoutId: number | null = null;

  private readonly formBuilder = inject(FormBuilder);
  private readonly adminService = inject(AdminDataService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);

  protected activeTab: 'visitas' | 'pacientes' | 'usuarios' = 'visitas';
  protected loading = false;
  protected saving = false;
  protected errorMsg = '';
  protected successMsg = '';

  protected visits: any[] = [];
  protected patients: PatientDto[] = [];
  protected professionals: ProfessionalDto[] = [];

  protected currentPage = 1;
  protected totalVisits = 0;
  protected limit = 5;

  protected professionalAgenda: any[] = [];
  protected vagasRestantes: number | null = null;

  protected cancelingVisitId: string | null = null;
  protected motivoCancelamento = '';
  protected selectedPatientDetails: PatientDetailsDto | null = null;

  protected readonly filtersForm = this.formBuilder.nonNullable.group({
    data: [''],
    profissionalId: [''],
    status: [''],
  });

  protected readonly scheduleForm = this.formBuilder.nonNullable.group({
    pacienteId: ['', Validators.required],
    profissionalId: ['', Validators.required],
    tipo: ['AVALIACAO', Validators.required],
    dataHoraInicio: ['', Validators.required],
  });

  protected readonly patientForm = this.formBuilder.nonNullable.group({
    nome: ['', Validators.required],
    telefone: ['', Validators.required],
    convenio: ['', Validators.required],
    rua: ['', Validators.required],
    bairro: ['', Validators.required],
    cidade: ['', Validators.required],
    cep: ['', Validators.required],
    observacoes: [''],
  });

  protected readonly userForm = this.formBuilder.nonNullable.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    role: ['PROFISSIONAL', Validators.required],
    ativo: [true],
    tipo: ['ENFERMEIRO'],
    especialidade: [''],
    maxVisitasDia: [5],
  });

  ngOnInit(): void {
    this.loadAllData();

    this.filtersForm.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadVisits();
    });

    this.scheduleForm.controls.profissionalId.valueChanges.subscribe(() =>
      this.checkProfessionalSlots(),
    );
    this.scheduleForm.controls.dataHoraInicio.valueChanges.subscribe(() =>
      this.checkProfessionalSlots(),
    );
  }

  protected changeTab(tab: 'visitas' | 'pacientes' | 'usuarios'): void {
    this.activeTab = tab;
  }

  private clearFeedbackMessages(): void {
    if (this.feedbackTimeoutId !== null) {
      window.clearTimeout(this.feedbackTimeoutId);
      this.feedbackTimeoutId = null;
    }

    this.errorMsg = '';
    this.successMsg = '';
  }

  private showFeedback(message: string, type: 'success' | 'error'): void {
    this.clearFeedbackMessages();

    if (type === 'success') {
      this.successMsg = message;
      this.errorMsg = '';
    } else {
      this.errorMsg = message;
      this.successMsg = '';
    }

    this.feedbackTimeoutId = window.setTimeout(() => {
      this.clearFeedbackMessages();
      this.changeDetector.detectChanges();
    }, this.autoHideDelayMs);
  }

  protected loadAllData(): void {
    this.loadVisits();
    this.loadPatients();
    this.loadProfessionals();
  }

  protected loadVisits(): void {
    this.loading = true;

    const filterVal = this.filtersForm.value;
    this.adminService
      .getVisits({
        data: filterVal.data || undefined,
        profissionalId: filterVal.profissionalId || undefined,
        status: filterVal.status || undefined,
        page: this.currentPage,
        limit: this.limit,
      })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.changeDetector.detectChanges();
        }),
      )
      .subscribe({
        next: (res) => {
          this.visits = res.items || [];
          this.totalVisits = res.total || 0;
          this.changeDetector.detectChanges();
        },
        error: () => {
          this.showFeedback('Nao foi possivel carregar a lista de visitas.', 'error');
          this.changeDetector.detectChanges();
        },
      });
  }

  protected loadPatients(): void {
    this.adminService.getPatients().subscribe({
      next: (res) => {
        this.patients = res;
        this.changeDetector.detectChanges();
      },
    });
  }

  protected loadProfessionals(): void {
    this.adminService.getProfessionals().subscribe({
      next: (res) => {
        this.professionals = res.items || [];
        this.changeDetector.detectChanges();
      },
    });
  }

  protected scheduleVisit(): void {
    if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    this.adminService
      .scheduleVisit(this.scheduleForm.getRawValue())
      .pipe(
        finalize(() => {
          this.saving = false;
          this.changeDetector.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.showFeedback('Visita agendada com sucesso!', 'success');
          this.scheduleForm.reset({ tipo: 'AVALIACAO' });
          this.vagasRestantes = null;
          this.professionalAgenda = [];
          this.loadVisits();
          this.changeDetector.detectChanges();
        },
        error: (err) => {
          this.showFeedback(err.error?.message || 'Erro ao agendar a visita.', 'error');
          this.changeDetector.detectChanges();
        },
      });
  }

  protected checkProfessionalSlots(): void {
    const profId = this.scheduleForm.controls.profissionalId.value;
    const datetime = this.scheduleForm.controls.dataHoraInicio.value;

    if (!profId || !datetime) {
      this.vagasRestantes = null;
      this.professionalAgenda = [];
      return;
    }

    const dateOnly = datetime.substring(0, 10);
    this.adminService.getProfessionalAgenda(profId, dateOnly).subscribe({
      next: (res) => {
        this.vagasRestantes = res.vagasRestantes;
        this.professionalAgenda = res.visitas || [];
        this.changeDetector.detectChanges();
      },
      error: () => {
        this.vagasRestantes = null;
        this.professionalAgenda = [];
        this.changeDetector.detectChanges();
      },
    });
  }

  protected createPatient(): void {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    const formVal = this.patientForm.getRawValue();
    const payload = {
      nome: formVal.nome,
      telefone: formVal.telefone,
      convenio: formVal.convenio,
      endereco: {
        rua: formVal.rua,
        bairro: formVal.bairro,
        cidade: formVal.cidade,
        cep: formVal.cep,
      },
      observacoes: formVal.observacoes,
      ativo: true,
    };

    this.adminService
      .createPatient(payload)
      .pipe(
        finalize(() => {
          this.saving = false;
          this.changeDetector.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.showFeedback('Paciente cadastrado com sucesso!', 'success');
          this.patientForm.reset();
          this.loadPatients();
          this.changeDetector.detectChanges();
        },
        error: (err) => {
          this.showFeedback(err.error?.message || 'Erro ao cadastrar o paciente.', 'error');
          this.changeDetector.detectChanges();
        },
      });
  }

  protected togglePatientStatus(patient: PatientDto): void {
    if (!patient._id && !patient.id) return;
    const id = patient._id || patient.id!;
    const nextAtivo = !patient.ativo;

    this.adminService.updatePatient(id, { ativo: nextAtivo }).subscribe({
      next: () => {
        patient.ativo = nextAtivo;
        this.showFeedback(
          `Status do paciente alterado com sucesso para ${nextAtivo ? 'Ativo' : 'Inativo'}.`,
          'success',
        );
        this.changeDetector.detectChanges();
      },
      error: (err) => {
        this.showFeedback(err.error?.message || 'Erro ao alterar status do paciente.', 'error');
        this.changeDetector.detectChanges();
      },
    });
  }

  protected registerUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    const formVal = this.userForm.getRawValue();
    const payload = {
      nome: formVal.nome,
      email: formVal.email,
      senha: formVal.senha,
      role: formVal.role,
      ativo: formVal.ativo,
      professionalInfo:
        formVal.role === 'PROFISSIONAL'
          ? {
              tipo: formVal.tipo,
              especialidade: formVal.especialidade,
              maxVisitasDia: formVal.maxVisitasDia,
            }
          : undefined,
    };

    this.adminService
      .createUser(payload)
      .pipe(
        finalize(() => {
          this.saving = false;
          this.changeDetector.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.showFeedback('Usuario/Profissional cadastrado com sucesso!', 'success');
          this.userForm.reset({
            role: 'PROFISSIONAL',
            ativo: true,
            tipo: 'ENFERMEIRO',
            maxVisitasDia: 5,
          });
          this.loadProfessionals();
          this.changeDetector.detectChanges();
        },
        error: (err) => {
          this.showFeedback(err.error?.message || 'Erro ao cadastrar o usuario.', 'error');
          this.changeDetector.detectChanges();
        },
      });
  }

  protected confirmVisit(id: string): void {
    this.loading = true;
    this.adminService
      .updateVisitStatus(id, { status: 'CONFIRMADA' })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.changeDetector.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.showFeedback('Visita confirmada com sucesso.', 'success');
          this.loadVisits();
          this.changeDetector.detectChanges();
        },
        error: (err) => {
          this.showFeedback(err.error?.message || 'Erro ao confirmar a visita.', 'error');
          this.changeDetector.detectChanges();
        },
      });
  }

  protected startCancellation(id: string): void {
    this.cancelingVisitId = id;
    this.motivoCancelamento = '';
  }

  protected cancelCancellation(): void {
    this.cancelingVisitId = null;
    this.motivoCancelamento = '';
  }

  protected submitCancellation(): void {
    if (!this.cancelingVisitId) return;
    if (!this.motivoCancelamento.trim()) {
      this.showFeedback('Informe o motivo do cancelamento.', 'error');
      return;
    }

    this.loading = true;
    const id = this.cancelingVisitId;
    this.adminService
      .updateVisitStatus(id, { status: 'CANCELADA', motivoCancelamento: this.motivoCancelamento })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cancelingVisitId = null;
          this.motivoCancelamento = '';
          this.changeDetector.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.showFeedback('Visita cancelada com sucesso.', 'success');
          this.loadVisits();
          this.changeDetector.detectChanges();
        },
        error: (err) => {
          this.showFeedback(err.error?.message || 'Erro ao cancelar a visita.', 'error');
          this.changeDetector.detectChanges();
        },
      });
  }

  protected get totalPages(): number {
    return Math.ceil(this.totalVisits / this.limit) || 1;
  }

  protected changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadVisits();
    }
  }

  protected formatProfessional(visit: any): string {
    if (!visit.profissionalId) return 'Nao associado';
    if (typeof visit.profissionalId === 'string') {
      const p = this.professionals.find((prof) => (prof._id || prof.id) === visit.profissionalId);
      return p ? p.usuarioId?.nome : 'Profissional';
    }
    return visit.profissionalId.usuarioId?.nome || 'Profissional';
  }

  protected formatPatient(visit: any): string {
    if (!visit.pacienteId) return 'Nao associado';
    if (typeof visit.pacienteId === 'string') {
      const pat = this.patients.find((p) => (p._id || p.id) === visit.pacienteId);
      return pat ? pat.nome : 'Paciente';
    }
    return visit.pacienteId.nome || 'Paciente';
  }

  protected formatPatientBairro(visit: any): string {
    if (!visit.pacienteId) return '';
    if (typeof visit.pacienteId === 'string') {
      const pat = this.patients.find((p) => (p._id || p.id) === visit.pacienteId);
      return pat ? pat.endereco?.bairro || '' : '';
    }
    return visit.pacienteId.endereco?.bairro || '';
  }

  protected formatTime(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  protected formatDateLabel(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR');
  }

  protected openPatientDetails(patient: PatientDto): void {
    this.selectedPatientDetails = this.toPatientDetails(patient);
  }

  protected openPatientFromVisit(visit: any): void {
    const patient = this.resolvePatientFromVisit(visit);

    if (patient) {
      this.openPatientDetails(patient);
    }
  }

  protected closePatientDetails(): void {
    this.selectedPatientDetails = null;
  }

  private resolvePatientFromVisit(visit: any): PatientDto | null {
    if (!visit.pacienteId) {
      return null;
    }

    if (typeof visit.pacienteId === 'string') {
      return (
        this.patients.find((patient) => (patient._id || patient.id) === visit.pacienteId) ?? null
      );
    }

    const patientId = visit.pacienteId._id || visit.pacienteId.id;
    const fromList = patientId
      ? this.patients.find((patient) => (patient._id || patient.id) === patientId)
      : null;

    if (fromList) {
      return fromList;
    }

    return {
      nome: visit.pacienteId.nome,
      telefone: visit.pacienteId.telefone ?? '',
      convenio: visit.pacienteId.convenio ?? '',
      endereco: {
        rua: visit.pacienteId.endereco?.rua ?? '',
        bairro: visit.pacienteId.endereco?.bairro ?? '',
        cidade: visit.pacienteId.endereco?.cidade ?? '',
        cep: visit.pacienteId.endereco?.cep ?? '',
      },
      observacoes: visit.pacienteId.observacoes,
      ativo: visit.pacienteId.ativo ?? true,
    };
  }

  private toPatientDetails(patient: PatientDto): PatientDetailsDto {
    return {
      nome: patient.nome,
      telefone: patient.telefone,
      convenio: patient.convenio,
      endereco: patient.endereco,
      observacoes: patient.observacoes,
      ativo: patient.ativo,
    };
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}

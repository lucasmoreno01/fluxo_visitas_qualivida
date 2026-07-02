import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AdminDataService, PatientDto, ProfessionalDto } from '../../../../core/services/admin-data.service';
import { AuthService } from '../../../auth/services/auth-service';

@Component({
  selector: 'app-admin-visits-page',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './admin-visits-page.html',
  styleUrl: './admin-visits-page.scss',
})
export class AdminVisitsPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly adminService = inject(AdminDataService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected activeTab: 'visitas' | 'pacientes' | 'usuarios' = 'visitas';
  protected loading = false;
  protected saving = false;
  protected errorMsg = '';
  protected successMsg = '';

  // Data lists
  protected visits: any[] = [];
  protected patients: PatientDto[] = [];
  protected professionals: ProfessionalDto[] = [];

  // Pagination & Filtering
  protected currentPage = 1;
  protected totalVisits = 0;
  protected limit = 5;

  // Real-time professional slots check
  protected professionalAgenda: any[] = [];
  protected vagasRestantes: number | null = null;

  // Cancellation Modal/FormState
  protected cancelingVisitId: string | null = null;
  protected motivoCancelamento = '';

  // Forms
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

    // Listen to filter changes to automatically reload visits
    this.filtersForm.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadVisits();
    });

    // Listen to professional & date changes in the schedule form to show vagas restantes
    this.scheduleForm.controls.profissionalId.valueChanges.subscribe(() => this.checkProfessionalSlots());
    this.scheduleForm.controls.dataHoraInicio.valueChanges.subscribe(() => this.checkProfessionalSlots());
  }

  protected changeTab(tab: 'visitas' | 'pacientes' | 'usuarios'): void {
    this.activeTab = tab;
    this.errorMsg = '';
    this.successMsg = '';
  }

  protected loadAllData(): void {
    this.loadVisits();
    this.loadPatients();
    this.loadProfessionals();
  }

  protected loadVisits(): void {
    this.loading = true;
    this.errorMsg = '';

    const filterVal = this.filtersForm.value;
    this.adminService
      .getVisits({
        data: filterVal.data || undefined,
        profissionalId: filterVal.profissionalId || undefined,
        status: filterVal.status || undefined,
        page: this.currentPage,
        limit: this.limit,
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.visits = res.items || [];
          this.totalVisits = res.total || 0;
        },
        error: () => {
          this.errorMsg = 'Nao foi possivel carregar a lista de visitas.';
        },
      });
  }

  protected loadPatients(): void {
    this.adminService.getPatients().subscribe({
      next: (res) => (this.patients = res),
    });
  }

  protected loadProfessionals(): void {
    this.adminService.getProfessionals().subscribe({
      next: (res) => (this.professionals = res.items || []),
    });
  }

  // Scheduling
  protected scheduleVisit(): void {
    if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.adminService
      .scheduleVisit(this.scheduleForm.getRawValue())
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.successMsg = 'Visita agendada com sucesso!';
          this.scheduleForm.reset({ tipo: 'AVALIACAO' });
          this.vagasRestantes = null;
          this.professionalAgenda = [];
          this.loadVisits();
        },
        error: (err) => {
          this.errorMsg = err.error?.message || 'Erro ao agendar a visita.';
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

    const dateOnly = datetime.substring(0, 10); // Extract YYYY-MM-DD
    this.adminService.getProfessionalAgenda(profId, dateOnly).subscribe({
      next: (res) => {
        this.vagasRestantes = res.vagasRestantes;
        this.professionalAgenda = res.visitas || [];
      },
      error: () => {
        this.vagasRestantes = null;
        this.professionalAgenda = [];
      },
    });
  }

  // Patient Actions
  protected createPatient(): void {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMsg = '';
    this.successMsg = '';

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
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.successMsg = 'Paciente cadastrado com sucesso!';
          this.patientForm.reset();
          this.loadPatients();
        },
        error: (err) => {
          this.errorMsg = err.error?.message || 'Erro ao cadastrar o paciente.';
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
        this.successMsg = `Status do paciente alterado com sucesso para ${nextAtivo ? 'Ativo' : 'Inativo'}.`;
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Erro ao alterar status do paciente.';
      },
    });
  }

  // User Actions
  protected registerUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMsg = '';
    this.successMsg = '';

    const formVal = this.userForm.getRawValue();
    const payload = {
      nome: formVal.nome,
      email: formVal.email,
      senha: formVal.senha,
      role: formVal.role,
      ativo: formVal.ativo,
      professionalInfo: formVal.role === 'PROFISSIONAL' ? {
        tipo: formVal.tipo,
        especialidade: formVal.especialidade,
        maxVisitasDia: formVal.maxVisitasDia,
      } : undefined,
    };

    this.adminService
      .createUser(payload)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.successMsg = 'Usuario/Profissional cadastrado com sucesso!';
          this.userForm.reset({ role: 'PROFISSIONAL', ativo: true, tipo: 'ENFERMEIRO', maxVisitasDia: 5 });
          this.loadProfessionals();
        },
        error: (err) => {
          this.errorMsg = err.error?.message || 'Erro ao cadastrar o usuario.';
        },
      });
  }

  // Visit status updates (Confirm / Cancel)
  protected confirmVisit(id: string): void {
    this.loading = true;
    this.adminService
      .updateVisitStatus(id, { status: 'CONFIRMADA' })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.successMsg = 'Visita confirmada com sucesso.';
          this.loadVisits();
        },
        error: (err) => {
          this.errorMsg = err.error?.message || 'Erro ao confirmar a visita.';
        },
      });
  }

  protected startCancellation(id: string): void {
    this.cancelingVisitId = id;
    this.motivoCancelamento = '';
    this.errorMsg = '';
    this.successMsg = '';
  }

  protected cancelCancellation(): void {
    this.cancelingVisitId = null;
    this.motivoCancelamento = '';
  }

  protected submitCancellation(): void {
    if (!this.cancelingVisitId) return;
    if (!this.motivoCancelamento.trim()) {
      this.errorMsg = 'Informe o motivo do cancelamento.';
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
        }),
      )
      .subscribe({
        next: () => {
          this.successMsg = 'Visita cancelada com sucesso.';
          this.loadVisits();
        },
        error: (err) => {
          this.errorMsg = err.error?.message || 'Erro ao cancelar a visita.';
        },
      });
  }

  // Pagination Helpers
  protected get totalPages(): number {
    return Math.ceil(this.totalVisits / this.limit) || 1;
  }

  protected changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadVisits();
    }
  }

  // Format details for rendering
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

  protected logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}

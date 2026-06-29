"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VISIT_DURATION_IN_MINUTES = exports.VisitStatus = exports.VisitType = exports.ProfessionalType = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["PROFISSIONAL"] = "PROFISSIONAL";
})(UserRole || (exports.UserRole = UserRole = {}));
var ProfessionalType;
(function (ProfessionalType) {
    ProfessionalType["ENFERMEIRO"] = "ENFERMEIRO";
    ProfessionalType["FISIOTERAPEUTA"] = "FISIOTERAPEUTA";
    ProfessionalType["MEDICO"] = "MEDICO";
})(ProfessionalType || (exports.ProfessionalType = ProfessionalType = {}));
var VisitType;
(function (VisitType) {
    VisitType["AVALIACAO"] = "AVALIACAO";
    VisitType["CURATIVO"] = "CURATIVO";
    VisitType["FISIOTERAPIA"] = "FISIOTERAPIA";
    VisitType["MEDICACAO"] = "MEDICACAO";
})(VisitType || (exports.VisitType = VisitType = {}));
var VisitStatus;
(function (VisitStatus) {
    VisitStatus["AGENDADA"] = "AGENDADA";
    VisitStatus["CONFIRMADA"] = "CONFIRMADA";
    VisitStatus["EM_ANDAMENTO"] = "EM_ANDAMENTO";
    VisitStatus["CONCLUIDA"] = "CONCLUIDA";
    VisitStatus["CANCELADA"] = "CANCELADA";
})(VisitStatus || (exports.VisitStatus = VisitStatus = {}));
exports.VISIT_DURATION_IN_MINUTES = {
    [VisitType.AVALIACAO]: 60,
    [VisitType.FISIOTERAPIA]: 45,
    [VisitType.CURATIVO]: 30,
    [VisitType.MEDICACAO]: 20,
};
//# sourceMappingURL=enums.js.map
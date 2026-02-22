import { t } from '../../i18n/es';

const STEPS = [
  { key: 'accepted', label: t.workflow.steps.accepted, icon: '✓' },
  { key: 'scheduling', label: t.workflow.steps.scheduling, icon: '📅' },
  { key: 'visit', label: t.workflow.steps.visit, icon: '🏠' },
  { key: 'documents', label: t.workflow.steps.documents, icon: '📄' },
  { key: 'lease', label: t.workflow.steps.lease, icon: '📝' },
] as const;

const STAGE_TO_STEP: Record<string, number> = {
  ACCEPTED: 0,
  SCHEDULING: 1,
  VISIT_CONFIRMED: 2,
  VISIT_COMPLETED: 2,
  VISIT_CANCELLED: 1,
  DOCUMENTS_PENDING: 3,
  READY_FOR_LEASE: 4,
  LEASE_ACTIVE: 4,
  LEASE_ENDED: 4,
};

export function WorkflowStepper({ currentStage }: { currentStage: string }) {
  const activeStep = STAGE_TO_STEP[currentStage] ?? 0;

  return (
    <div className="flex items-center justify-between mb-8">
      {STEPS.map((step, idx) => {
        const isCompleted = idx < activeStep;
        const isActive = idx === activeStep;

        return (
          <div key={step.key} className="flex items-center flex-1">
            {/* Step circle */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isActive
                      ? 'bg-rumi-primary text-white ring-4 ring-rumi-primary/20'
                      : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isCompleted ? '✓' : step.icon}
              </div>
              <span
                className={`text-xs mt-1.5 text-center font-medium ${
                  isCompleted
                    ? 'text-green-600'
                    : isActive
                      ? 'text-rumi-primary'
                      : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {idx < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mt-[-1rem] ${
                  idx < activeStep ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

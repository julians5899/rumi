import { t } from '../../i18n/es';
import { IconCheck, IconCalendar, IconHome, IconDocument, IconClipboard } from '../ui/Icons';
import { type ReactNode } from 'react';

const STEPS: { key: string; label: string; icon: ReactNode }[] = [
  { key: 'accepted', label: t.workflow.steps.accepted, icon: <IconCheck className="w-4 h-4" /> },
  { key: 'scheduling', label: t.workflow.steps.scheduling, icon: <IconCalendar className="w-4 h-4" /> },
  { key: 'visit', label: t.workflow.steps.visit, icon: <IconHome className="w-4 h-4" /> },
  { key: 'documents', label: t.workflow.steps.documents, icon: <IconDocument className="w-4 h-4" /> },
  { key: 'lease', label: t.workflow.steps.lease, icon: <IconClipboard className="w-4 h-4" /> },
];

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
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-500 text-white shadow-md shadow-green-500/20'
                    : isActive
                      ? 'bg-rumi-primary text-white ring-4 ring-rumi-primary/20 shadow-md shadow-rumi-primary/20'
                      : 'bg-rumi-bg text-rumi-text/30 border-2 border-rumi-primary-light/20'
                }`}
              >
                {isCompleted ? <IconCheck className="w-5 h-5" /> : step.icon}
              </div>
              <span
                className={`text-xs mt-1.5 text-center font-medium transition-colors ${
                  isCompleted
                    ? 'text-green-600'
                    : isActive
                      ? 'text-rumi-primary'
                      : 'text-rumi-text/30'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {idx < STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 mt-[-1rem] rounded-full overflow-hidden bg-rumi-primary-light/15">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    idx < activeStep ? 'bg-green-500 w-full' : 'w-0'
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

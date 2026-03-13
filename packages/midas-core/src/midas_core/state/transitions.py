"""Valid state transitions for workflow steps."""

from mds_common.types.enums import StepStatus

VALID_TRANSITIONS: dict[StepStatus, set[StepStatus]] = {
    StepStatus.PENDING: {StepStatus.RUNNING, StepStatus.BLOCKED, StepStatus.SKIPPED},
    StepStatus.BLOCKED: {StepStatus.PENDING, StepStatus.SKIPPED},
    StepStatus.RUNNING: {StepStatus.COMPLETED, StepStatus.FAILED, StepStatus.AWAITING_HUMAN},
    StepStatus.FAILED: {StepStatus.PENDING},  # Retry only
    StepStatus.AWAITING_HUMAN: {StepStatus.RUNNING, StepStatus.SKIPPED},
    StepStatus.COMPLETED: set(),  # Terminal — immutable
    StepStatus.SKIPPED: set(),  # Terminal — immutable
}

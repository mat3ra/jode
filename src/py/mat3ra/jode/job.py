"""Job class for computational job management."""

from typing import Any, Dict, List, Optional

from mat3ra.code.entity import InMemoryEntitySnakeCase
from mat3ra.esse.models.job.base import JobBaseSchema
from mat3ra.esse.models.system.job_extended import ExtendedJobSchema
from pydantic import Field


JOB_FINAL_STATUSES = ["finished", "error", "terminated", "timeout"]


class Job(JobBaseSchema, ExtendedJobSchema, InMemoryEntitySnakeCase):
    """
    Job — core non-visual model for a computational job.

    Extends the ESSE JobBaseSchema and ExtendedJobSchema with convenience
    methods for status checking, material management, and workflow access.

    Attributes:
        name: Name of the job.
        status: Current status of the job (e.g., pre-submission, active, finished).
        workflow: Workflow configuration (as dict).
        compute: Compute configuration.
    """

    status_track: List[Dict[str, Any]] = Field(default_factory=list, alias="statusTrack")

    @property
    def is_in_final_status(self) -> bool:
        """Returns True when the job has a terminal status."""
        return self.status.value in JOB_FINAL_STATUSES

    @property
    def is_submitted(self) -> bool:
        return self.status.value == "submitted"

    @property
    def is_active(self) -> bool:
        return self.status.value == "active"

    @property
    def is_error(self) -> bool:
        return self.status.value == "error"

    @property
    def is_in_initial_status(self) -> bool:
        return self.status.value == "pre-submission"

    @property
    def is_in_running_status(self) -> bool:
        return self.status.value in ("active", "submitted")

    @property
    def status_track_sorted(self) -> List[Dict[str, Any]]:
        """Status track items sorted chronologically."""
        return sorted(self.status_track, key=lambda item: item.get("trackedAt", 0))

    @property
    def submitted_timestamp(self) -> Optional[Dict[str, Any]]:
        return next((s for s in self.status_track if s.get("status") == "submitted"), None)

    @property
    def active_timestamp(self) -> Optional[Dict[str, Any]]:
        return next((s for s in self.status_track if s.get("status") == "active"), None)

    @property
    def final_timestamp(self) -> Optional[Dict[str, Any]]:
        for final_status in JOB_FINAL_STATUSES:
            entry = next((s for s in self.status_track if s.get("status") == final_status), None)
            if entry:
                return entry
        return None

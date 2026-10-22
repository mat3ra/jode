"""Tests for the Job Python class."""

import pytest
from mat3ra.jode import Job, JOB_FINAL_STATUSES
from mat3ra.made.material import Material, defaultMaterialConfig
from mat3ra.wode.workflows.workflow import Workflow


MINIMAL_COMPUTE = {
    "queue": "D",
    "nodes": 1,
    "ppn": 1,
    "timeLimit": "01:00:00",
}

MINIMAL_PROJECT = {
    "_id": "project-1",
}


def make_job_config(overrides=None):
    config = {
        "name": "Test Job",
        "status": "pre-submission",
        "compute": MINIMAL_COMPUTE,
        "_project": MINIMAL_PROJECT,
        "statusTrack": [],
    }
    if overrides:
        config.update(overrides)
    return config


def test_creation():
    job = Job(**make_job_config())
    assert job.name == "Test Job"


def test_status_pre_submission():
    job = Job(**make_job_config())
    assert job.is_in_initial_status is True
    assert job.is_in_final_status is False


def test_status_submitted():
    job = Job(**make_job_config({"status": "submitted"}))
    assert job.is_submitted is True
    assert job.is_in_running_status is True


def test_status_active():
    job = Job(**make_job_config({"status": "active"}))
    assert job.is_active is True
    assert job.is_in_running_status is True


def test_status_error():
    job = Job(**make_job_config({"status": "error"}))
    assert job.is_error is True
    assert job.is_in_final_status is True


def test_final_statuses():
    for status in JOB_FINAL_STATUSES:
        job = Job(**make_job_config({"status": status}))
        assert job.is_in_final_status is True, f"Expected {status} to be a final status"


def test_status_track_sorted():
    status_track = [
        {"status": "active", "trackedAt": 2000},
        {"status": "submitted", "trackedAt": 1000},
    ]
    job = Job(**make_job_config({"statusTrack": status_track}))
    sorted_track = job.status_track_sorted
    assert sorted_track[0]["trackedAt"] < sorted_track[1]["trackedAt"]


def test_submitted_timestamp():
    status_track = [
        {"status": "submitted", "trackedAt": 1000},
        {"status": "active", "trackedAt": 2000},
    ]
    job = Job(**make_job_config({"status": "active", "statusTrack": status_track}))
    assert job.submitted_timestamp is not None
    assert job.submitted_timestamp["status"] == "submitted"


def test_to_dict():
    job = Job(**make_job_config())
    data = job.to_dict()
    assert data["name"] == "Test Job"
    assert data["status"] == "pre-submission"


def test_create_render_and_reload(monkeypatch):
    material = Material.create({**defaultMaterialConfig, "_id": "material-1"})
    workflow = Workflow(name="Calculation")
    job = Job.create_from_workflow(workflow, material, compute=MINIMAL_COMPUTE, _project=MINIMAL_PROJECT)
    contexts = []

    def render(instance, context):
        contexts.append(context)
        instance.name = "Rendered"

    monkeypatch.setattr(Workflow, "render", render)
    assert contexts == []
    job.render()
    assert contexts == [{"material": material, "jobHasParent": False}]
    assert workflow.name == "Calculation"
    serialized = job.to_dict()
    assert serialized["workflow"]["name"] == "Rendered"
    assert serialized["_material"] == {"_id": "material-1"}
    assert "_material_instance" not in serialized
    restored = Job.from_json(job.to_json())
    with pytest.raises(ValueError, match="set_material"):
        restored.render()
    restored.set_material(material)
    restored.render()
    assert len(contexts) == 2


def test_render_requires_workflow():
    job = Job(**make_job_config())
    job.set_material(Material.create(defaultMaterialConfig))
    with pytest.raises(ValueError, match="Workflow not found"):
        job.render()


def test_parent_context_and_material_without_identifier(monkeypatch):
    job = Job.create_from_workflow(
        Workflow(name="Calculation"),
        Material.create(defaultMaterialConfig),
        **make_job_config({"parent": {"_id": "parent-1"}}),
    )
    contexts = []
    monkeypatch.setattr(Workflow, "render", lambda instance, context: contexts.append(context))
    job.render()
    assert contexts[0]["jobHasParent"] is True
    assert "_material" not in job.to_dict()

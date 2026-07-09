"""Tests for the Job Python class."""

from mat3ra.jode import Job, JOB_FINAL_STATUSES


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

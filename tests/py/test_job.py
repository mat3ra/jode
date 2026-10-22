"""Tests for the Job Python class."""

from copy import deepcopy

import pytest
from mat3ra.jode import Job, JOB_FINAL_STATUSES
from mat3ra.made.material import Material, defaultMaterialConfig
from mat3ra.standata.workflows import WorkflowStandata
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
    assert contexts == [{"material": material, "materials": [material], "materialsSet": None, "jobHasParent": False}]
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


def test_multi_material_factory_render_and_reload(monkeypatch):
    materials = [Material.create({**defaultMaterialConfig, "_id": f"material-{index}"}) for index in range(2)]
    workflow = Workflow(name="Multiple materials", isMultiMaterial=True)
    job = Job.create_from_workflow(workflow, materials, _materialsSet={"_id": "set-1"}, **make_job_config())
    contexts = []
    monkeypatch.setattr(Workflow, "render", lambda instance, context: contexts.append(context))
    job.render()
    assert contexts == [
        {
            "material": materials[0],
            "materials": materials,
            "materialsSet": {"_id": "set-1"},
            "jobHasParent": False,
        }
    ]
    serialized = job.to_dict()
    assert serialized["_materials"] == [{"_id": "material-0"}, {"_id": "material-1"}]
    assert "_material" not in serialized
    assert "_material_instances" not in serialized
    restored = Job.from_json(job.to_json())
    with pytest.raises(ValueError, match="set_materials"):
        restored.render()
    restored.set_materials(materials)
    restored.render()
    assert contexts[0] == contexts[1]
    # Rebinding a single material must not leave stale multi-material references.
    restored.set_material(materials[1])
    restored.render()
    assert contexts[-1]["materials"] == [materials[1]]
    assert "_materials" not in restored.to_dict()


def test_multi_material_without_identifiers_keeps_order_without_partial_references(monkeypatch):
    materials = [
        Material.create({**defaultMaterialConfig, "_id": "identified"}),
        Material.create(defaultMaterialConfig),
    ]
    job = Job.create_from_workflow(Workflow(name="Multiple", isMultiMaterial=True), materials, **make_job_config())
    contexts = []
    monkeypatch.setattr(Workflow, "render", lambda instance, context: contexts.append(context))
    job.render()
    assert contexts[0]["materials"] == materials
    assert "_materials" not in job.to_dict()


@pytest.mark.parametrize("is_multi_material", [False, True])
def test_empty_material_list_fails(is_multi_material):
    with pytest.raises(ValueError, match="at least one material"):
        Job.create_from_workflow(Workflow(name="Empty", isMultiMaterial=is_multi_material), [], **make_job_config())


def test_multi_material_factory_accepts_one_material():
    material = Material.create({**defaultMaterialConfig, "_id": "material-1"})
    job = Job.create_from_workflow(Workflow(name="Multiple", isMultiMaterial=True), material, **make_job_config())
    assert job.to_dict()["_materials"] == [{"_id": "material-1"}]


def test_single_material_factory_uses_first_list_item_like_javascript():
    materials = [Material.create({**defaultMaterialConfig, "_id": f"material-{index}"}) for index in range(2)]
    job = Job.create_from_workflow(Workflow(name="Single"), materials, **make_job_config())
    assert job.to_dict()["_material"] == {"_id": "material-0"}
    assert "_materials" not in job.to_dict()


def test_render_standata_multimaterial_job():
    definition = deepcopy(WorkflowStandata.find_by_application_and_name("espresso", "Equation of State"))
    definition["isMultiMaterial"] = True
    materials = [Material.create({**defaultMaterialConfig, "_id": f"material-{index}"}) for index in range(3)]
    selected_material = materials[2].to_dict()
    selected_material["basis"]["coordinates"][1]["value"] = [0.375, 0.375, 0.375]
    materials[2] = Material.create(selected_material)
    for subworkflow in definition["subworkflows"]:
        subworkflow["units"].append(
            {"type": "assignment", "name": "material-index", "operand": "MATERIAL_INDEX", "value": "2"}
        )
        for unit in subworkflow["units"]:
            if unit["type"] == "execution":
                subworkflow["model"]["method"]["subtype"] = "paw"
                subworkflow["model"]["method"]["data"]["pseudo"] = [{"element": "Si", "filename": "Si.upf"}]
                unit["context"] = [
                    {"name": "cutoffs", "data": {"wavefunction": 24, "density": 192}},
                    {"name": "kgrid", "data": {"dimensions": [4, 4, 4]}},
                ]
    job = Job.create_from_workflow(Workflow(**definition), materials, **make_job_config())
    job.render()
    serialized = job.to_dict()
    assert serialized["_materials"] == [{"_id": f"material-{index}"} for index in range(3)]
    inputs = [
        item["rendered"]
        for subworkflow in serialized["workflow"]["subworkflows"]
        for unit in subworkflow["units"]
        if unit["type"] == "execution"
        for item in unit["input"]
    ]
    assert len(inputs) == 1
    assert "Si 28.085000 Si.upf" in inputs[0]
    assert "Si     0.375000000    0.375000000    0.375000000" in inputs[0]
    assert "4 4 4 0 0 0" in inputs[0]

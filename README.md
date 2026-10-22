[![npm version](https://badge.fury.io/js/%40mat3ra%2Fjode.svg)](https://badge.fury.io/js/%40mat3ra%2Fjode)
[![License: Apache](https://img.shields.io/badge/License-Apache-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

# JoDe

JOb DEsign elements — non-visual Job class, enums, and utilities.

## Installation

```bash
npm install @mat3ra/jode
```

## Python

```bash
pip install mat3ra-jode
```

Create a job from a WoDe workflow and a MADE material, then render explicitly:

```python
from mat3ra.jode import Job

job = Job.create_from_workflow(
    workflow,
    material,
    _project={"_id": "project-id"},
    compute={"queue": "D", "nodes": 1, "ppn": 1, "timeLimit": "01:00:00"},
)
job.render()
job_json = job.to_json()
```

The factory keeps the ordinary Pydantic constructor and accepts additional job
configuration as keyword arguments. Rendering delegates to WoDe; execution belongs
to a job runtime. It does not change the supplied workflow.

For `workflow.isMultiMaterial`, pass an ordered list of materials (or one material).
The factory binds the list with `set_materials()` and rendering passes both the primary
material and the full list to WoDe. As in JavaScript, a single-material workflow uses
the first material when given a list. Empty lists fail.

Live materials are private and excluded from serialization. `_material` contains a
single entity reference when available; `_materials` contains the ordered references
only when every material has an ID, avoiding a partial list that changes indexing.
After loading JSON, call `set_material()` or `set_materials()` before rendering again.
WoDe supports QE SCF rendering; STANDATA's `pw_scf_volume_scaled` flavor handles
material-index selection. The ordinary `pw_scf` flavor is unchanged. Unsupported
providers and geometry raise errors.

This draft temporarily pins [WoDe #169](https://github.com/mat3ra/wode/pull/169)
by commit. Replace the pin with its published version after WoDe is merged and released.
WoDe uses the published utils `2026.10.22.post0` and STANDATA `2026.10.22.post1` releases.

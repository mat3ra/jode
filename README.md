[![npm version](https://badge.fury.io/js/%40mat3ra%2Fjode.svg)](https://badge.fury.io/js/%40mat3ra%2Fjode)
[![License: Apache](https://img.shields.io/badge/License-Apache-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

# Jode

JOb DEsign elements — non-visual Job class, enums, and utilities.

## Installation

```bash
npm install @mat3ra/jode
```

## Python

```bash
pip install mat3ra-jode
```

Create a job from a WODE workflow and a MADE material, then render explicitly:

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
configuration as keyword arguments. Rendering delegates to WODE; execution belongs
to a job runtime. It does not change the supplied workflow. The live material is
private and excluded from serialization; `_material` contains its entity reference
when it has an ID. After loading a job from JSON, call `job.set_material(material)`
before rendering again. WODE currently supports single-material QE SCF rendering;
unsupported providers and geometry raise errors.

This draft temporarily pins [WODE #169](https://github.com/mat3ra/wode/pull/169)
by commit. Replace the pin with its published version after WODE is merged and released.

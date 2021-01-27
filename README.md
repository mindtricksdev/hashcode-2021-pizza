Run `tools/visualisation.bat` to init the visual tool (starts static file server)

Run `tools/upload.bat` to move content to upload folder (prepares solution for uploading to hashcode)

Run `node index` to run the solution (use VS Code debugger to target one set or all sets)
- `node index` runs for all sets
- `node index a` runs for set a
- `node index a,b` runs for set a and b

`node index && call tools/upload.bat` (run solution for all sets and create the files needed to upload the solution)

---

Write code in `code/solution.js` to solve the problem.

- Implement `run(firstLine, input, env)` and `return [result, info]`
  - `firstLine` is an array of number/string  [line 1]
  - `input` is an array of arrays (of number/string)  [line 2 to end]
  - `env` contains utils and information about the context
  - `result` should be an array of array you want to serialize and dump in the `out/` folder 
  - `info` can be any metadata you want dumped from the execution (it is saved in `out/summary.json` and read by visualisation tool)
    - should contain `score` if possible
    - other properties present in `info` will be shown in the visual tool

Write code in `visualisation/render.js` to draw inputs/outputs

- Implement `renderInput(env, input)` and `renderOutput(env, input, output)`
- Based on the input/output file contents draw a visualisation in _canvas_ 


---
[![Screenshot-84.png](https://i.postimg.cc/Dyv0WfWX/Screenshot-84.png)](https://postimg.cc/bd5pWh9y)

const fetchFile = (file) => {
  return fetch(file).then((r) => r.text());
};
const fetchFiles = (files) => {
  return Promise.all(files.map((f) => fetchFile(f)));
};

const fetchFolders = async () => {
  const inputs = await fetch("/in/")
    .then((response) => response.text())
    .then((r) => {
      const inIndex = $(r);
      const files = inIndex
        .find(".display-name > a")
        .toArray()
        .map((i) => $(i).text())
        .filter((f) => f !== "../");
      return files.map((f) => ({
        name: f,
        file: "/in/" + f,
      }));
    });

  const outputs = await fetch("/out/")
    .then((response) => response.text())
    .then((r) => {
      const outIndex = $(r);
      const files = outIndex
        .find(".display-name > a")
        .toArray()
        .map((i) => $(i).text())
        .filter((f) => f !== "../")
        .filter((f) => f !== "summary.json");
      return files.map((f) => ({
        name: f,
        file: "/out/" + f,
      }));
    });

  const summary = await fetch("/out/summary.json").then((response) =>
    response.json()
  );

  return {
    inputs,
    outputs,
    summary,
  };
};

const getEnv = () => {
  const params = getHashParameters();
  return {
    params,
  };
};

const createSidebar = ({ inputs, outputs, summary }) => {
  $("#sidebar-inputs").empty();
  inputs.forEach((input) => {
    const $entry = $(
      `<div class='sidebar-item' data-name="${input.name}">${input.name}</div>`
    );
    $entry.on("click", () => {
      $(".sidebar-item").removeClass("active");
      if (getHashParameter("file") !== input.name)
        updateHashParameter("file", input.name);
      $entry.addClass("active");
      $("#sidebar-info").empty();
      fetchFile(input.file).then((content) => {
        renderInput(getEnv(), content);
      });
    });
    $("#sidebar-inputs").append($entry);
  });
  $("#sidebar-outputs").empty();
  let score = 0;
  outputs.forEach((output) => {
    const outputSummary = summary[output.name];
    const $entry = $(
      `<div class='sidebar-item' data-name='${output.name}'>
        ${output.name}
        <div class='sidebar-item-score'>${outputSummary.score?.toLocaleString()}</div>
      </div>`
    );
    score += outputSummary.score;
    $entry.on("click", () => {
      $(".sidebar-item").removeClass("active");
      if (getHashParameter("file") !== output.name)
        updateHashParameter("file", output.name);
      $entry.addClass("active");
      const input = inputs.find((i) => i.name.startsWith(output.name[0]));
      renderSummary(outputSummary);
      $("#sidebar-info").empty();
      fetchFiles([input.file, output.file]).then(
        ([inputContent, outputContent]) => {
          renderOutput(getEnv(), inputContent, outputContent);
        }
      );
    });
    $("#sidebar-outputs").append($entry);
  });
  $("#sidebar-score").text(score.toLocaleString());
};

const renderSummary = (meta) => {
  const $summary = $("#sidebar-summary");
  $summary.empty();
  Object.keys(meta).map((key) => {
    let value = meta[key];
    if (typeof value === "number") value = value.toLocaleString();
    $summary.append(
      `<div class="sidebar-info-row"><div class="sidebar-info-key">${key}</div><div class="sidebar-info-value">${value}</div></div>`
    );
  });
};

const renderInfo = (info) => {
  const $info = $("#sidebar-info");
  $info.empty();
  Object.keys(info).map((key) => {
    let value = info[key];
    if (typeof value === "number") value = value.toLocaleString();
    $info.append(
      `<div class="sidebar-info-row"><div class="sidebar-info-key">${key}</div><div class="sidebar-info-value">${value}</div></div>`
    );
  });
};

const resumeNavigation = () => {
  const file = getHashParameter("file");
  if (file) {
    const item = $(".sidebar-item[data-name='" + file + "']");
    item.click();
  }
};

const updateHashParameter = (key, value) => {
  const hash = window.location.hash.substr(1);
  const params = hash.split("&").reduce(function (res, item) {
    var parts = item.split("=");
    res[parts[0]] = parts[1];
    return res;
  }, {});
  params[key] = value;

  window.location.hash =
    "#" +
    Object.keys(params).reduce((a, key) => {
      return (a ? a + "&" : a) + key + "=" + params[key];
    }, "");
};

const getHashParameters = () => {
  const hash = window.location.hash.substr(1);
  const params = hash.split("&").reduce(function (res, item) {
    var parts = item.split("=");

    const intVal = parseInt(parts[1], 10);
    if (isNaN(intVal)) {
      res[parts[0]] = parts[1];
    } else {
      res[parts[0]] = intVal;
    }

    return res;
  }, {});
  return params;
};
const getHashParameter = (key) => {
  const params = getHashParameters();
  return params[key];
};

const renderRulers = (width, height) => {
  const bbox = document.getElementById("canvas").getBoundingClientRect();
  const crtWidth = bbox.width;
  const crtHeight = bbox.height;
  $("#rulers").width(crtWidth);
  $("#rulers").height(crtHeight);

  const $hor = $("#horizontal-ruler");
  const COUNT_X = Math.min(width, 20);
  const unitWidth = crtWidth / COUNT_X;
  $hor.empty();
  for (let tick = 0; tick < COUNT_X; tick++) {
    const pointsTo = (tick / COUNT_X) * width;
    $(`<div class="rule-unit">${Math.floor(pointsTo)}</div>`)
      .css({
        left: tick * unitWidth,
        width: unitWidth,
      })
      .appendTo($hor);
  }

  const $ver = $("#vertical-ruler");
  const COUNT_Y = Math.min(height, 20);
  const unitHeight = crtHeight / COUNT_Y;
  $ver.empty();
  for (let tick = 0; tick < COUNT_Y; tick++) {
    const pointsTo = (tick / COUNT_Y) * height;
    $(`<div class="rule-unit">${Math.floor(pointsTo)}</div>`)
      .css({
        top: tick * unitHeight,
        height: unitHeight,
        lineHeight: unitHeight + "px",
      })
      .appendTo($ver);
  }
};

const renderTimeline = (time) => {
  time += 1;

  $("#timeline").show();
  $("#timeline-crt").empty();
  for (let t = 0; t < time; t++) {
    $("#timeline-crt").append($("<option />").val(t).text(t));
  }
  let crtTime = getHashParameter("time");
  if (parseInt(crtTime) >= time) {
    crtTime = time - 1;
    updateHashParameter("time", crtTime);
  }
  $("#timeline-crt")
    .off("change")
    .change((e) => {
      crtTime = parseInt(e.target.value);
      updateHashParameter("time", crtTime);
      refreshPreview();
    });
  $("#timeline-crt").val(crtTime);

  $("#timeline-prev")
    .off("click")
    .click(() => {
      const newTime = Math.max(0, parseInt(getHashParameter("time") || 1) - 1);
      updateHashParameter("time", newTime);
      $("#timeline-crt").val(newTime);
      refreshPreview();
    });
  $("#timeline-next")
    .off("click")
    .click(() => {
      const newTime = Math.min(
        parseInt(getHashParameter("time") || 0) + 1,
        time - 1
      );
      updateHashParameter("time", newTime);
      $("#timeline-crt").val(newTime);
      refreshPreview();
    });
};

const refreshPreview = () => {
  $(".sidebar-item.active").click();
};

fetchFolders().then((folders) => {
  createSidebar(folders);
  resumeNavigation();
});

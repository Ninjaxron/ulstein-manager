let chart;
let datasets;
let headers;

document.getElementById("fileButton").addEventListener("click", function () {
    document.getElementById("fileInput").click();
});

document.getElementById("fileInput").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const fileContent = e.target.result;

            const rows = fileContent.split("\n");
            headers = rows[0].split(",");
            datasets = [];

            for (let i = 1; i < headers.length; i++) {
                const dataset = {
                    label: headers[i],
                    backgroundColor: [], 
                    data: [],
                };
                datasets.push(dataset);
            }

            for (let i = 1; i < rows.length; i++) {
                const values = rows[i].split(",");
                for (let j = 1; j < values.length; j++) {
                    const value = parseFloat(values[j]);
                    datasets[j - 1].data.push(isNaN(value) ? null : value);
                    datasets[j - 1].backgroundColor.push(null); 
                }
            }

            const ctx = document.getElementById("ChartItem").getContext("2d");

            const initialChartType = document.getElementById("chartType").value || 'bar';

            chart = new Chart(ctx, {
                type: initialChartType,
                data: {
                    labels: rows.slice(1).map(row => row.split(",")[0]),
                    datasets: datasets,
                },
                options: {
                    legend: { display: true },
                    scales: {
                        xAxes: [
                            {
                                type: "linear",
                                position: "bottom",
                                ticks: {
                                    min: Number.MIN_SAFE_INTEGER,
                                    max: Number.MAX_SAFE_INTEGER,
                                    stepSize: 1,
                                },
                            },
                        ],
                        yAxes: [
                            {
                                ticks: {
                                    min: Number.MIN_SAFE_INTEGER,
                                    max: Number.MAX_SAFE_INTEGER,
                                    stepSize: 1,
                                },
                            },
                        ],
                    },
                    plugins: {
                        zoom: {
                            limits: {
                                x: { min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER },
                                y: { min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER },
                            },
                            pan: {
                                enabled: true,
                            },
                            zoom: {
                                wheel: { enabled: true },
                                pinch: { enabled: true },
                                mode: "xy",
                            },
                            drag: {
                                enabled: true,
                            },
                        },
                    },
                },
            });

            document.getElementById("fileButton").style.display = "none";

            document.getElementById("zoomInButton").addEventListener("click", function () {
                chart.zoomIn();
            });

            document.getElementById("zoomOutButton").addEventListener("click", function () {
                chart.zoomOut();
            });

            document.getElementById("togglePanButton").addEventListener("click", function () {
                chart.options.plugins.zoom.pan.enabled = !chart.options.plugins.zoom.pan.enabled;
                chart.options.plugins.zoom.zoom.enabled = !chart.options.plugins.zoom.zoom.enabled;
                chart.update();
            });

            document.getElementById("centerGraphButton").addEventListener("click", function () {
                chart.resetZoom();
            });

            const mc = new Hammer.Manager(document.getElementById("ChartItem"));
            mc.add(new Hammer.Pinch());
            mc.on("pinch", function (event) {
                chart.options.plugins.zoom.zoom.amount *= event.scale;
                chart.update();
            });
        };
        reader.readAsText(file);
    }
});

document.getElementById("configButton").addEventListener("click", function () {
    openConfigModal();
});

document.getElementById("closeConfig").addEventListener("click", function () {
    closeConfigModal();
});

document.getElementById("saveConfig").addEventListener("click", function () {
    saveConfig();
});

document.getElementById("changeChartType").addEventListener("click", function () {
    openChartTypeModal();
});

function openChartTypeModal() {
    document.getElementById("chartTypeModal").style.display = "block";
}

function closeChartTypeModal() {
    document.getElementById("chartTypeModal").style.display = "none";
}

function changeChartType() {
    const selectedChartType = document.getElementById("newChartType").value;
    chart.config.type = selectedChartType;
    chart.update();
    closeChartTypeModal();
}

function openConfigModal() {
    const seriesDropdown = document.getElementById("seriesDropdown");
    seriesDropdown.innerHTML = "";
    datasets.forEach((dataset, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = dataset.label;
        seriesDropdown.appendChild(option);
    });

    document.getElementById("configModal").style.display = "block";
}

function closeConfigModal() {
    document.getElementById("configModal").style.display = "none";
}

function saveConfig() {
    const selectedSeriesIndex = document.getElementById("seriesDropdown").value;
    const seriesName = document.getElementById("seriesName").value;
    const seriesColor = document.getElementById("seriesColor").value;
    const chartType = document.getElementById("chartType").value;
    const chartTitle = document.getElementById("chartTitle").value;

    datasets[selectedSeriesIndex].label = seriesName;

    datasets[selectedSeriesIndex].backgroundColor = datasets[selectedSeriesIndex].backgroundColor.map(() => seriesColor);

    chart.config.type = chartType;
    chart.data.labels = rows.slice(1).map(row => row.split(",")[0]);

    chart.options.title.text = chartTitle;

    chart.update();

    document.getElementById("title").textContent = chartTitle;

    closeConfigModal();
}
